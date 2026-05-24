import unittest
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from main import app


class AppIterationApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/app-iteration-api.db"
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

    def test_engagement_check_in_tracks_streak_and_mascot_unlocks(self):
        first = self.client.post(
            "/api/v1/engagement/check-in",
            json={"clientId": "demo-device", "mood": "开心", "checkInDate": "2026-05-01"},
        )
        self.assertEqual(first.status_code, 200)
        first_payload = first.json()
        self.assertEqual(first_payload["streak_days"], 1)
        self.assertEqual(first_payload["mascot"]["expression"], "smile")
        self.assertEqual(first_payload["mascot"]["color"], "sprout-green")

        twentieth = None
        for day in range(2, 21):
            twentieth = self.client.post(
                "/api/v1/engagement/check-in",
                json={
                    "clientId": "demo-device",
                    "mood": "平静",
                    "checkInDate": f"2026-05-{day:02d}",
                },
            )
        self.assertEqual(twentieth.status_code, 200)
        twentieth_payload = twentieth.json()
        self.assertEqual(twentieth_payload["streak_days"], 20)
        self.assertEqual(twentieth_payload["mascot"]["level"], "steady-sprout")
        self.assertIn("sage-cape", twentieth_payload["mascot"]["unlocked_accessories"])

    def test_engagement_check_in_reports_return_prompt_after_gap(self):
        self.client.post(
            "/api/v1/engagement/check-in",
            json={"clientId": "returning-device", "mood": "开心", "checkInDate": "2026-05-01"},
        )

        response = self.client.post(
            "/api/v1/engagement/check-in",
            json={"clientId": "returning-device", "mood": "焦虑", "checkInDate": "2026-05-04"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["streak_days"], 1)
        self.assertEqual(payload["missed_days"], 2)
        self.assertIn("草团子已经 2 天没见到你啦", payload["return_prompt"])
        self.assertEqual(payload["mascot"]["expression"], "worried")

    def test_emotion_insight_returns_tag_and_comfort_message(self):
        response = self.client.get("/api/v1/emotion-insights/焦虑")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["mood"], "焦虑")
        self.assertEqual(payload["tag"], "需要安稳")
        self.assertIn("先把呼吸放慢", payload["comfort"])

    def test_psychological_assessment_requires_guardian_signature_for_minor(self):
        response = self.client.post(
            "/api/v1/psychological-assessments",
            json={
                "clientId": "minor-device",
                "consentAccepted": True,
                "userSignature": "学生",
                "isMinor": True,
                "answers": {
                    "sleep": 4,
                    "anxiety": 4,
                    "sadness": 3,
                    "energy": 2,
                    "focus": 4,
                },
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_psychological_assessment_scores_and_persists_consent(self):
        response = self.client.post(
            "/api/v1/psychological-assessments",
            json={
                "clientId": "adult-device",
                "consentAccepted": True,
                "userSignature": "测试用户",
                "isMinor": False,
                "answers": {
                    "sleep": 4,
                    "anxiety": 5,
                    "sadness": 4,
                    "energy": 2,
                    "focus": 4,
                },
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertGreaterEqual(payload["score"], 14)
        self.assertEqual(payload["level"], "high")
        self.assertIn("匿名化后用于研究/产品分析/商业合作", payload["consent_usage"])
        self.assertGreater(payload["assessment_id"], 0)

    def test_monthly_mindfulness_themes_returns_twelve_months(self):
        response = self.client.get("/api/v1/mindfulness/monthly-themes")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 12)
        self.assertEqual(payload[0]["month"], 1)
        self.assertEqual(payload[-1]["month"], 12)

    def test_soap_round_selects_different_skin_when_available(self):
        response = self.client.post(
            "/api/v1/games/soap/round",
            json={
                "currentSkin": "mint",
                "unlockedSkins": ["mint", "peach", "lavender"],
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn(payload["skin"], ["peach", "lavender"])
        self.assertNotEqual(payload["skin"], "mint")


if __name__ == "__main__":
    unittest.main()
