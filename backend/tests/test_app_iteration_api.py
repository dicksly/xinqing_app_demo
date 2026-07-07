import unittest
import json
from tempfile import TemporaryDirectory

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.models.models import PsychologicalAssessment
from main import app


REVERSE_SCORED_ITEMS = {3, 5, 8, 10, 12, 14, 17, 20, 22, 27}
DOCX_SCORE_INTERPRETATIONS = [
    (
        0,
        "critical",
        "严重心理健康风险",
        "可能正经历严重情绪困扰，需要尽快寻求专业心理帮助或可信赖成年人的支持。",
    ),
    (
        25,
        "very_low",
        "心理健康状态较差",
        "可能存在明显的情绪与生活困难，建议寻求辅导员、家长或专业人士的支持。",
    ),
    (
        49,
        "moderate",
        "中等心理健康挑战",
        "可能正面对一定程度的压力或情绪问题，但仍具备部分应对能力。适当支持与健康调节方式可能会有帮助。",
    ),
    (
        73,
        "healthy",
        "心理健康状态良好",
        "整体情绪较稳定，能够较好地应对生活中的挑战。继续保持健康习惯和支持关系很重要。",
    ),
    (
        97,
        "strong",
        "心理健康状态非常良好",
        "表现出较强的情绪韧性、社会支持与日常适应能力。建议继续维持良好的生活方式与人际关系。",
    ),
]


def build_teen_wellness_answers(scored_value=2):
    return {
        f"q{item_number}": 4 - scored_value if item_number in REVERSE_SCORED_ITEMS else scored_value
        for item_number in range(1, 31)
    }


def build_teen_wellness_answers_for_score(target_score):
    remaining = target_score
    answers = {}
    for item_number in range(1, 31):
        scored_value = max(0, min(4, remaining))
        answers[f"q{item_number}"] = (
            4 - scored_value if item_number in REVERSE_SCORED_ITEMS else scored_value
        )
        remaining -= scored_value
    return answers


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
                "answers": build_teen_wellness_answers(scored_value=3),
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_psychological_assessment_scores_docx_scale_and_persists_answers(self):
        answers = build_teen_wellness_answers(scored_value=4)
        response = self.client.post(
            "/api/v1/psychological-assessments",
            json={
                "clientId": "adult-device",
                "consentAccepted": True,
                "userSignature": "测试用户",
                "isMinor": False,
                "answers": answers,
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["score"], 120)
        self.assertEqual(payload["max_score"], 120)
        self.assertEqual(payload["level"], "strong")
        self.assertEqual(payload["tag"], "心理健康状态非常良好")
        self.assertEqual(payload["raw_answers"]["q3"], 0)
        self.assertEqual(payload["scored_answers"]["q3"], 4)
        self.assertEqual(payload["subscale_scores"]["emotional_wellbeing"], 24)
        self.assertEqual(payload["subscale_scores"]["self_care_habits"], 24)
        self.assertEqual(payload["scale_version"], "teen-mental-wellness-30-v1")
        self.assertIn("匿名化后用于研究/产品分析/商业合作", payload["consent_usage"])
        self.assertGreater(payload["assessment_id"], 0)

        db = self.session_local()
        try:
            record = db.query(PsychologicalAssessment).filter(
                PsychologicalAssessment.id == payload["assessment_id"]
            ).one()
            self.assertEqual(record.max_score, 120)
            self.assertEqual(record.scale_version, "teen-mental-wellness-30-v1")
            self.assertEqual(json.loads(record.raw_answers)["q3"], 0)
            self.assertEqual(json.loads(record.scored_answers)["q3"], 4)
            self.assertEqual(json.loads(record.subscale_scores)["social_connections"], 24)
        finally:
            db.close()

    def test_psychological_assessment_total_matches_subscale_sum_for_midpoint_answers(self):
        response = self.client.post(
            "/api/v1/psychological-assessments",
            json={
                "clientId": "midpoint-device",
                "consentAccepted": True,
                "userSignature": "测试用户",
                "isMinor": False,
                "answers": build_teen_wellness_answers(scored_value=2),
            },
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["score"], 60)
        self.assertEqual(sum(payload["subscale_scores"].values()), payload["score"])
        self.assertEqual(payload["subscale_scores"]["emotional_wellbeing"], 12)
        self.assertEqual(payload["subscale_scores"]["stress_coping"], 12)
        self.assertEqual(payload["level"], "moderate")

    def test_psychological_assessment_interpretations_match_questionnaire_docx(self):
        for score, level, tag, diagnosis in DOCX_SCORE_INTERPRETATIONS:
            with self.subTest(score=score):
                response = self.client.post(
                    "/api/v1/psychological-assessments",
                    json={
                        "clientId": f"docx-interpretation-{score}",
                        "consentAccepted": True,
                        "userSignature": "测试用户",
                        "isMinor": False,
                        "answers": build_teen_wellness_answers_for_score(score),
                    },
                )

                self.assertEqual(response.status_code, 200)
                payload = response.json()
                self.assertEqual(payload["score"], score)
                self.assertEqual(payload["level"], level)
                self.assertEqual(payload["tag"], tag)
                self.assertEqual(payload["wellness_state"], tag)
                self.assertEqual(payload["diagnosis"], diagnosis)

    def test_psychological_assessment_rejects_incomplete_docx_scale_answers(self):
        answers = build_teen_wellness_answers(scored_value=2)
        answers.pop("q30")

        response = self.client.post(
            "/api/v1/psychological-assessments",
            json={
                "clientId": "incomplete-device",
                "consentAccepted": True,
                "userSignature": "测试用户",
                "isMinor": False,
                "answers": answers,
            },
        )

        self.assertEqual(response.status_code, 422)

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
