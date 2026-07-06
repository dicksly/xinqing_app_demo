import base64
import unittest
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.services.volcengine_tts_service import (
    VolcengineTTSService,
    normalize_tts_text,
)
from main import app


class KnowledgeTTSApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_settings_expose_volcengine_tts_configuration(self):
        settings = Settings(
            VOLCENGINE_TTS_API_KEY="test-key",
            VOLCENGINE_TTS_SPEAKER="zh_female_test_voice",
        )

        self.assertEqual(settings.VOLCENGINE_TTS_API_KEY, "test-key")
        self.assertEqual(settings.VOLCENGINE_TTS_RESOURCE_ID, "seed-tts-2.0")
        self.assertEqual(settings.VOLCENGINE_TTS_AUDIO_FORMAT, "mp3")
        self.assertEqual(settings.VOLCENGINE_TTS_SPEAKER, "zh_female_test_voice")

    def test_default_volcengine_speaker_matches_seed_tts_two_resource(self):
        settings = Settings()

        self.assertEqual(settings.VOLCENGINE_TTS_RESOURCE_ID, "seed-tts-2.0")
        self.assertEqual(settings.VOLCENGINE_TTS_SPEAKER, "zh_female_wenrouxiaoya_uranus_bigtts")

    def test_normalize_tts_text_strips_html_and_limits_whitespace(self):
        normalized = normalize_tts_text("  <h1>标题</h1><p>第一段&nbsp;内容。</p>\n\n第二段  ")

        self.assertEqual(normalized, "标题 第一段 内容。 第二段")

    def test_volcengine_service_builds_official_session_payload(self):
        service = VolcengineTTSService(
            Settings(
                VOLCENGINE_TTS_API_KEY="test-key",
                VOLCENGINE_TTS_SPEAKER="zh_female_test_voice",
                VOLCENGINE_TTS_SAMPLE_RATE=24000,
                VOLCENGINE_TTS_BIT_RATE=128000,
            )
        )

        payload = service.build_start_session_payload(speed=12)

        self.assertEqual(payload["req_params"]["speaker"], "zh_female_test_voice")
        self.assertEqual(payload["req_params"]["audio_params"]["format"], "mp3")
        self.assertEqual(payload["req_params"]["audio_params"]["sample_rate"], 24000)
        self.assertEqual(payload["req_params"]["audio_params"]["bit_rate"], 128000)
        self.assertEqual(payload["req_params"]["audio_params"]["speech_rate"], 12)
        self.assertNotIn("model", payload["req_params"])

    def test_volcengine_service_wraps_text_in_task_request_params(self):
        service = VolcengineTTSService(Settings(VOLCENGINE_TTS_API_KEY="test-key"))

        payload = service.build_task_request_payload("你好，欢迎来到心晴。")

        self.assertEqual(payload, {"req_params": {"text": "你好，欢迎来到心晴。"}})

    def test_knowledge_tts_endpoint_returns_data_url_audio(self):
        fake_audio = b"mp3-audio"

        with patch(
            "app.api.v1.api.tts_service.synthesize",
            new=AsyncMock(return_value=fake_audio),
        ) as synthesize:
            response = self.client.post(
                "/api/v1/knowledge/tts",
                json={"title": "身体扎根", "text": "先让脚底踩稳。"},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(
            payload["audio_data"],
            f"data:audio/mp3;base64,{base64.b64encode(fake_audio).decode('ascii')}",
        )
        self.assertEqual(payload["audio_format"], "mp3")
        self.assertEqual(payload["provider"], "volcengine")
        self.assertEqual(payload["text_length"], len("先让脚底踩稳。"))
        synthesize.assert_awaited_once()

    def test_knowledge_tts_endpoint_rejects_empty_text(self):
        response = self.client.post(
            "/api/v1/knowledge/tts",
            json={"title": "空内容", "text": "   <p></p>   "},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
