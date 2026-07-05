import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.core.config import settings
from main import app


class PublicBetaP0Tests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/public-beta-p0.db"
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
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_emotion_records_and_weekly_report_are_scoped_by_client_id(self):
        self.client.post(
            "/api/v1/emotion-records",
            json={
                "clientId": "device-a",
                "mood": "开心",
                "energyLevel": 80,
                "sleepQuality": 4,
                "happyMoment": "完成了一件小事",
            },
        )
        self.client.post(
            "/api/v1/emotion-records",
            json={
                "clientId": "device-b",
                "mood": "焦虑",
                "energyLevel": 20,
                "sleepQuality": 2,
                "happyMoment": "另一台设备的记录",
            },
        )

        list_response = self.client.get(
            "/api/v1/emotion-records",
            params={"clientId": "device-a"},
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)
        self.assertEqual(list_response.json()[0]["mood"], "开心")

        weekly_response = self.client.get(
            "/api/v1/emotion-records/weekly-report",
            params={"clientId": "device-a"},
        )
        self.assertEqual(weekly_response.status_code, 200)
        payload = weekly_response.json()
        self.assertEqual(payload["total_records"], 1)
        self.assertEqual(payload["mood_distribution"], {"开心": 1})

    def test_treehole_delete_requires_owner_client_id(self):
        create_response = self.client.post(
            "/api/v1/treehole-entries",
            json={
                "clientId": "owner-device",
                "content": "这是我的树洞",
                "isPublished": True,
            },
        )
        self.assertEqual(create_response.status_code, 200)
        entry_id = create_response.json()["id"]

        forbidden = self.client.delete(
            f"/api/v1/treehole-entries/{entry_id}",
            params={"clientId": "other-device"},
        )
        self.assertEqual(forbidden.status_code, 403)

        still_public = self.client.get("/api/v1/treehole-entries")
        self.assertEqual(len(still_public.json()), 1)

        owner_delete = self.client.delete(
            f"/api/v1/treehole-entries/{entry_id}",
            params={"clientId": "owner-device"},
        )
        self.assertEqual(owner_delete.status_code, 200)

    def test_password_reset_request_does_not_expose_code_by_default(self):
        register = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "beta-user",
                "password": "old-password",
                "email": "beta@example.com",
            },
        )
        self.assertEqual(register.status_code, 200)

        request = self.client.post(
            "/api/v1/auth/password-reset/request",
            json={"account": "beta-user"},
        )

        self.assertEqual(request.status_code, 200)
        payload = request.json()
        self.assertEqual(payload["delivery"], "manual")
        self.assertIsNone(payload.get("reset_code"))

    def test_legacy_admin_password_is_not_accepted(self):
        legacy_response = self.client.post(
            "/api/v1/admin/login",
            json={"username": settings.ADMIN_BOOTSTRAP_USERNAME, "password": "admin123"},
        )
        self.assertEqual(legacy_response.status_code, 401)

        bootstrap_response = self.client.post(
            "/api/v1/admin/login",
            json={
                "username": settings.ADMIN_BOOTSTRAP_USERNAME,
                "password": settings.ADMIN_BOOTSTRAP_PASSWORD,
            },
        )
        self.assertEqual(bootstrap_response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
