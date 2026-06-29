import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from main import app


class TreeholeApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/treehole-api.db"
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

    def test_severe_entry_is_forced_private_even_when_user_requests_publish(self):
        response = self.client.post(
            "/api/v1/treehole-entries",
            json={
                "content": "我不想活了",
                "isPublished": True,
                "isAnonymous": True,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["risk_level"], "severe")
        self.assertFalse(payload["is_published"])

        public_response = self.client.get("/api/v1/treehole-entries")
        self.assertEqual(public_response.status_code, 200)
        self.assertEqual(public_response.json(), [])

    def test_public_entries_are_sanitized_and_do_not_expose_images_or_ai_reply(self):
        response = self.client.post(
            "/api/v1/treehole-entries",
            json={
                "content": "我是张三，电话 13800138000，今天有点累。",
                "imageData": "data:image/png;base64,abc",
                "isPublished": True,
            },
        )
        self.assertEqual(response.status_code, 200)

        public_response = self.client.get("/api/v1/treehole-entries")

        self.assertEqual(public_response.status_code, 200)
        payload = public_response.json()
        self.assertEqual(len(payload), 1)
        self.assertNotIn("张三", payload[0]["content"])
        self.assertNotIn("13800138000", payload[0]["content"])
        self.assertIsNone(payload[0]["image_data"])
        self.assertIsNone(payload[0]["ai_response"])

    def test_rejects_invalid_or_too_large_image_data(self):
        invalid_response = self.client.post(
            "/api/v1/treehole-entries",
            json={
                "content": "图片格式不对",
                "imageData": "data:text/html;base64,abc",
            },
        )
        self.assertEqual(invalid_response.status_code, 422)

        large_response = self.client.post(
            "/api/v1/treehole-entries",
            json={
                "content": "图片太大",
                "imageData": "data:image/png;base64," + ("a" * 2_000_001),
            },
        )
        self.assertEqual(large_response.status_code, 422)

    def test_can_delete_treehole_entry_from_backend(self):
        create_response = self.client.post(
            "/api/v1/treehole-entries",
            json={"content": "稍后删除", "isPublished": True},
        )
        self.assertEqual(create_response.status_code, 200)
        entry_id = create_response.json()["id"]

        delete_response = self.client.delete(f"/api/v1/treehole-entries/{entry_id}")

        self.assertEqual(delete_response.status_code, 200)
        public_response = self.client.get("/api/v1/treehole-entries")
        self.assertEqual(public_response.json(), [])

    def test_public_treehole_interactions_are_persisted(self):
        create_response = self.client.post(
            "/api/v1/treehole-entries",
            json={"content": "今天有点难，但我想试着说出来。", "isPublished": True},
        )
        self.assertEqual(create_response.status_code, 200)
        entry_id = create_response.json()["id"]

        like_response = self.client.post(
            f"/api/v1/treehole-entries/{entry_id}/like",
            json={"clientId": "device-a"},
        )
        self.assertEqual(like_response.status_code, 200)
        self.assertTrue(like_response.json()["liked"])
        self.assertEqual(like_response.json()["like_count"], 1)

        comment_response = self.client.post(
            f"/api/v1/treehole-entries/{entry_id}/comments",
            json={"clientId": "device-b", "content": "我也有过类似的时候，抱抱你。"},
        )
        self.assertEqual(comment_response.status_code, 200)
        comment_id = comment_response.json()["id"]

        reply_response = self.client.post(
            f"/api/v1/treehole-entries/{entry_id}/comments/{comment_id}/replies",
            json={"clientId": "device-a", "content": "谢谢你愿意回应我。"},
        )
        self.assertEqual(reply_response.status_code, 200)

        interaction_response = self.client.get(
            f"/api/v1/treehole-entries/{entry_id}/interactions",
            params={"clientId": "device-a"},
        )

        self.assertEqual(interaction_response.status_code, 200)
        payload = interaction_response.json()
        self.assertEqual(payload["entry_id"], entry_id)
        self.assertTrue(payload["liked"])
        self.assertEqual(payload["like_count"], 1)
        self.assertEqual(len(payload["comments"]), 1)
        self.assertEqual(payload["comments"][0]["content"], "我也有过类似的时候，抱抱你。")
        self.assertEqual(payload["comments"][0]["replies"][0]["content"], "谢谢你愿意回应我。")

        unlike_response = self.client.post(
            f"/api/v1/treehole-entries/{entry_id}/like",
            json={"clientId": "device-a"},
        )
        self.assertEqual(unlike_response.status_code, 200)
        self.assertFalse(unlike_response.json()["liked"])
        self.assertEqual(unlike_response.json()["like_count"], 0)


if __name__ == "__main__":
    unittest.main()
