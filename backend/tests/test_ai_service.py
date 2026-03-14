import unittest
from unittest.mock import patch

from app.core.config import settings
from app.services.ai_service import AIService


class AIServiceTests(unittest.TestCase):
    def setUp(self):
        self.service = AIService()
        self.original_api_key = settings.AI_API_KEY
        self.original_api_base = settings.AI_API_BASE
        self.original_ai_model = getattr(settings, "AI_MODEL", None)

    def tearDown(self):
        settings.AI_API_KEY = self.original_api_key
        settings.AI_API_BASE = self.original_api_base
        if self.original_ai_model is None:
            if hasattr(settings, "AI_MODEL"):
                delattr(settings, "AI_MODEL")
        else:
            settings.AI_MODEL = self.original_ai_model

    def test_generate_response_uses_llm_when_api_is_configured(self):
        settings.AI_API_KEY = "test-key"
        settings.AI_API_BASE = "https://example.com/v1"
        settings.AI_MODEL = "Pro/deepseek-ai/DeepSeek-V3.2"

        with patch.object(self.service, "_request_chat_completion", return_value="LLM reply"):
            response = self.service.generate_response("今天状态很糟", "safe")

        self.assertEqual(response, "LLM reply")

    def test_generate_response_falls_back_when_llm_request_fails(self):
        settings.AI_API_KEY = "test-key"
        settings.AI_API_BASE = "https://example.com/v1"
        settings.AI_MODEL = "Pro/deepseek-ai/DeepSeek-V3.2"

        with patch.object(self.service, "_request_chat_completion", side_effect=RuntimeError("boom")):
            response = self.service.generate_response("今天状态很糟", "safe")

        self.assertIn("谢谢你愿意和我分享", response)


if __name__ == "__main__":
    unittest.main()
