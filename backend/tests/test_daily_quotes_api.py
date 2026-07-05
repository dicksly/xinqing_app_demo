import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, get_db
from main import app


class DailyQuotesApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/daily-quotes.db"
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

        login_response = self.client.post(
            "/api/v1/admin/login",
            json={
                "username": settings.ADMIN_BOOTSTRAP_USERNAME,
                "password": settings.ADMIN_BOOTSTRAP_PASSWORD,
            },
        )
        self.assertEqual(login_response.status_code, 200)
        self.admin_headers = {
            "Authorization": f"Bearer {login_response.json()['access_token']}"
        }

    def tearDown(self):
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_admin_can_create_update_and_delete_quote(self):
        create_response = self.client.post(
            "/api/v1/admin/daily-quotes",
            json={
                "text": "抬头的时候，也别忘了呼吸。",
                "author": "心晴",
                "status": "draft",
                "sort_order": 10,
                "locale": "zh-CN",
                "effective_date": "2026-03-16",
            },
            headers=self.admin_headers,
        )

        self.assertEqual(create_response.status_code, 200)
        quote_id = create_response.json()["id"]

        update_response = self.client.put(
            f"/api/v1/admin/daily-quotes/{quote_id}",
            json={
                "text": "抬头的时候，也别忘了慢一点呼吸。",
                "author": "心晴",
                "status": "published",
                "sort_order": 1,
                "locale": "zh-CN",
                "effective_date": "2026-03-17",
            },
            headers=self.admin_headers,
        )

        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "published")

        list_response = self.client.get(
            "/api/v1/admin/daily-quotes",
            headers=self.admin_headers,
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        delete_response = self.client.delete(
            f"/api/v1/admin/daily-quotes/{quote_id}",
            headers=self.admin_headers,
        )
        self.assertEqual(delete_response.status_code, 200)

        after_delete_response = self.client.get(
            "/api/v1/admin/daily-quotes",
            headers=self.admin_headers,
        )
        self.assertEqual(after_delete_response.status_code, 200)
        self.assertEqual(after_delete_response.json(), [])

    def test_public_daily_quote_returns_only_published_quote(self):
        draft_response = self.client.post(
            "/api/v1/admin/daily-quotes",
            json={
                "text": "这是草稿",
                "author": "草稿作者",
                "status": "draft",
                "sort_order": 99,
                "locale": "zh-CN",
                "effective_date": "2026-03-16",
            },
            headers=self.admin_headers,
        )
        self.assertEqual(draft_response.status_code, 200)

        published_response = self.client.post(
            "/api/v1/admin/daily-quotes",
            json={
                "text": "今天也可以慢慢来。",
                "author": "心晴",
                "status": "published",
                "sort_order": 1,
                "locale": "zh-CN",
                "effective_date": "2026-03-16",
            },
            headers=self.admin_headers,
        )
        self.assertEqual(published_response.status_code, 200)

        public_response = self.client.get("/api/v1/public/daily-quote")

        self.assertEqual(public_response.status_code, 200)
        payload = public_response.json()
        self.assertEqual(payload["text"], "今天也可以慢慢来。")
        self.assertEqual(payload["status"], "published")


if __name__ == "__main__":
    unittest.main()
