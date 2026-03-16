import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from main import app


class KnowledgeContentAdminApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/knowledge-content.db"
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
            json={"username": "admin", "password": "admin123"},
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

    def test_admin_can_create_and_update_video_and_article_content(self):
        create_video_response = self.client.post(
            "/api/v1/admin/knowledge-contents",
            json={
                "title": "和焦虑共处的 3 分钟练习",
                "summary": "一个适合午休时看的短视频。",
                "content": "视频简介",
                "content_type": "video",
                "category": "anxiety",
                "cover_url": "https://example.com/video-cover.jpg",
                "external_url": "https://example.com/video",
                "status": "draft",
                "sort_order": 5,
                "locale": "zh-CN",
                "published_at": "2026-03-16T08:00:00",
            },
            headers=self.admin_headers,
        )
        self.assertEqual(create_video_response.status_code, 200)
        content_id = create_video_response.json()["id"]

        update_article_response = self.client.put(
            f"/api/v1/admin/knowledge-contents/{content_id}",
            json={
                "title": "把身体带回此刻",
                "summary": "从视频切换为文章内容。",
                "content": "文章正文",
                "content_type": "article",
                "category": "mindfulness",
                "cover_url": "https://example.com/article-cover.jpg",
                "external_url": "",
                "status": "published",
                "sort_order": 1,
                "locale": "zh-CN",
                "published_at": "2026-03-17T08:00:00",
            },
            headers=self.admin_headers,
        )
        self.assertEqual(update_article_response.status_code, 200)
        self.assertEqual(update_article_response.json()["content_type"], "article")
        self.assertEqual(update_article_response.json()["status"], "published")

    def test_public_knowledge_contents_return_only_published_and_support_type_filter(self):
        for payload in (
            {
                "title": "已发布视频",
                "summary": "视频摘要",
                "content": "视频内容",
                "content_type": "video",
                "category": "anxiety",
                "cover_url": "https://example.com/video.jpg",
                "external_url": "https://example.com/video",
                "status": "published",
                "sort_order": 1,
                "locale": "zh-CN",
                "published_at": "2026-03-16T08:00:00",
            },
            {
                "title": "已发布文章",
                "summary": "文章摘要",
                "content": "文章内容",
                "content_type": "article",
                "category": "sleep",
                "cover_url": "https://example.com/article.jpg",
                "external_url": "",
                "status": "published",
                "sort_order": 2,
                "locale": "zh-CN",
                "published_at": "2026-03-16T09:00:00",
            },
            {
                "title": "草稿视频",
                "summary": "不应该出现在公共接口",
                "content": "草稿内容",
                "content_type": "video",
                "category": "stress",
                "cover_url": "https://example.com/draft.jpg",
                "external_url": "https://example.com/draft",
                "status": "draft",
                "sort_order": 3,
                "locale": "zh-CN",
                "published_at": "2026-03-16T10:00:00",
            },
        ):
            response = self.client.post(
                "/api/v1/admin/knowledge-contents",
                json=payload,
                headers=self.admin_headers,
            )
            self.assertEqual(response.status_code, 200)

        public_response = self.client.get("/api/v1/public/knowledge-contents")
        self.assertEqual(public_response.status_code, 200)
        self.assertEqual(len(public_response.json()), 2)

        video_response = self.client.get(
            "/api/v1/public/knowledge-contents",
            params={"content_type": "video"},
        )
        self.assertEqual(video_response.status_code, 200)
        self.assertEqual(len(video_response.json()), 1)
        self.assertEqual(video_response.json()[0]["title"], "已发布视频")


if __name__ == "__main__":
    unittest.main()
