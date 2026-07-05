import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base, get_db
from main import app


class KnowledgeTopicsApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/knowledge-topics.db"
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

    def test_admin_can_create_update_and_delete_topic(self):
        create_response = self.client.post(
            "/api/v1/admin/knowledge-topics",
            json={
                "title": "考试季抗压指南",
                "description": "帮助考生调整心态",
                "status": "draft",
                "content_count": 12,
                "locale": "zh-CN",
                "sort_order": 3,
            },
            headers=self.admin_headers,
        )
        self.assertEqual(create_response.status_code, 200)
        topic_id = create_response.json()["id"]

        update_response = self.client.put(
            f"/api/v1/admin/knowledge-topics/{topic_id}",
            json={
                "title": "考试季稳心指南",
                "description": "帮助考生稳住节奏",
                "status": "published",
                "content_count": 8,
                "locale": "zh-CN",
                "sort_order": 1,
            },
            headers=self.admin_headers,
        )
        self.assertEqual(update_response.status_code, 200)
        self.assertEqual(update_response.json()["status"], "published")

        list_response = self.client.get(
            "/api/v1/admin/knowledge-topics",
            headers=self.admin_headers,
        )
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()), 1)

        delete_response = self.client.delete(
            f"/api/v1/admin/knowledge-topics/{topic_id}",
            headers=self.admin_headers,
        )
        self.assertEqual(delete_response.status_code, 200)

    def test_public_topics_returns_published_ordered_list(self):
        for payload in (
            {
                "title": "草稿专题",
                "description": "不应该出现在公共接口",
                "status": "draft",
                "content_count": 5,
                "locale": "zh-CN",
                "sort_order": 5,
            },
            {
                "title": "第二个已发布专题",
                "description": "排序靠后",
                "status": "published",
                "content_count": 9,
                "locale": "zh-CN",
                "sort_order": 2,
            },
            {
                "title": "第一个已发布专题",
                "description": "排序靠前",
                "status": "published",
                "content_count": 7,
                "locale": "zh-CN",
                "sort_order": 1,
            },
        ):
            response = self.client.post(
                "/api/v1/admin/knowledge-topics",
                json=payload,
                headers=self.admin_headers,
            )
            self.assertEqual(response.status_code, 200)

        public_response = self.client.get("/api/v1/public/knowledge-topics")
        self.assertEqual(public_response.status_code, 200)

        payload = public_response.json()
        self.assertEqual([item["title"] for item in payload], ["第一个已发布专题", "第二个已发布专题"])


if __name__ == "__main__":
    unittest.main()
