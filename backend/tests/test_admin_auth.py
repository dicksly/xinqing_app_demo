import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.config import settings
from main import app


class AdminAuthTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/admin-auth.db"
        self.engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )
        self.session_local = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )
        Base.metadata.create_all(bind=self.engine)

        def override_get_db():
            db = self.session_local()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db
        self.client = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()
        settings.ENABLE_DEMO_PASSWORD_RESET = False
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_admin_login_succeeds_with_valid_credentials(self):
        response = self.client.post(
            "/api/v1/admin/login",
            json={
                "username": settings.ADMIN_BOOTSTRAP_USERNAME,
                "password": settings.ADMIN_BOOTSTRAP_PASSWORD,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["token_type"], "bearer")
        self.assertEqual(payload["user"]["username"], "admin")

    def test_admin_login_rejects_invalid_password(self):
        response = self.client.post(
            "/api/v1/admin/login",
            json={"username": settings.ADMIN_BOOTSTRAP_USERNAME, "password": "wrong-password"},
        )

        self.assertEqual(response.status_code, 401)

    def test_admin_me_requires_admin_token(self):
        response = self.client.get("/api/v1/admin/me")

        self.assertEqual(response.status_code, 401)

    def test_demo_password_recovery_resets_user_password(self):
        settings.ENABLE_DEMO_PASSWORD_RESET = True
        register = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "student",
                "password": "old-password",
                "email": "student@example.com",
            },
        )
        self.assertEqual(register.status_code, 200)

        request = self.client.post(
            "/api/v1/auth/password-reset/request",
            json={"account": "student"},
        )
        self.assertEqual(request.status_code, 200)
        request_payload = request.json()
        self.assertEqual(request_payload["delivery"], "demo")
        self.assertRegex(request_payload["reset_code"], r"^\d{6}$")

        confirm = self.client.post(
            "/api/v1/auth/password-reset/confirm",
            json={
                "account": "student",
                "resetCode": request_payload["reset_code"],
                "newPassword": "new-password",
            },
        )
        self.assertEqual(confirm.status_code, 200)

        old_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": "student", "password": "old-password"},
        )
        self.assertEqual(old_login.status_code, 401)

        new_login = self.client.post(
            "/api/v1/auth/login",
            json={"username": "student", "password": "new-password"},
        )
        self.assertEqual(new_login.status_code, 200)

    def test_demo_password_recovery_rejects_wrong_code(self):
        settings.ENABLE_DEMO_PASSWORD_RESET = True
        register = self.client.post(
            "/api/v1/auth/register",
            json={"username": "student2", "password": "old-password"},
        )
        self.assertEqual(register.status_code, 200)

        self.client.post(
            "/api/v1/auth/password-reset/request",
            json={"account": "student2"},
        )

        response = self.client.post(
            "/api/v1/auth/password-reset/confirm",
            json={
                "account": "student2",
                "resetCode": "000000",
                "newPassword": "new-password",
            },
        )

        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
