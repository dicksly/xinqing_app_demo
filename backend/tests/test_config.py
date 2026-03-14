import unittest
import importlib
import sys
from pathlib import Path

from app.core.config import Settings
from app.schemas.schemas import TreeholeEntryCreate


class SettingsTests(unittest.TestCase):
    def test_allowed_origins_defaults_to_wildcard_list(self):
        settings = Settings(ALLOWED_ORIGINS="*")

        self.assertEqual(settings.allowed_origins_list, ["*"])
        self.assertFalse(settings.cors_allow_credentials)

    def test_allowed_origins_splits_comma_separated_values(self):
        settings = Settings(
            ALLOWED_ORIGINS="https://app.example.com, https://admin.example.com"
        )

        self.assertEqual(
            settings.allowed_origins_list,
            ["https://app.example.com", "https://admin.example.com"],
        )
        self.assertTrue(settings.cors_allow_credentials)

    def test_allowed_media_types_split_comma_separated_values(self):
        settings = Settings(
            ALLOWED_IMAGE_TYPES="image/jpeg, image/png",
            ALLOWED_AUDIO_TYPES="audio/mpeg, audio/wav",
        )

        self.assertEqual(settings.allowed_image_types_list, ["image/jpeg", "image/png"])
        self.assertEqual(settings.allowed_audio_types_list, ["audio/mpeg", "audio/wav"])

    def test_database_engine_matches_configured_database_url(self):
        sys.modules.pop("main", None)
        main_module = importlib.import_module("main")

        self.assertEqual(
            str(main_module.engine.url),
            main_module.settings.DATABASE_URL,
        )

    def test_start_scripts_use_script_directory_as_project_root(self):
        repo_root = Path(__file__).resolve().parents[2]

        for script_name in ("start-backend.sh", "start-frontend.sh"):
            script_path = repo_root / script_name
            script_content = script_path.read_text(encoding="utf-8")

            self.assertIn('PROJECT_DIR="$SCRIPT_DIR"', script_content)

    def test_settings_explicitly_load_backend_dotenv_file(self):
        config = Settings.model_config

        expected_env_file = Path(__file__).resolve().parents[1] / ".env"
        self.assertEqual(config.get("env_file"), expected_env_file)

    def test_treehole_entry_allows_combined_text_voice_and_image_fields(self):
        entry = TreeholeEntryCreate(
            content="今天很累，但也拍了晚霞。",
            imageData="data:image/png;base64,abc",
            duration=18,
            hasVoiceChange=True,
            isPublished=True,
            isAnonymous=True,
        )

        self.assertEqual(entry.content, "今天很累，但也拍了晚霞。")
        self.assertEqual(entry.image_data, "data:image/png;base64,abc")
        self.assertEqual(entry.duration, 18)


if __name__ == "__main__":
    unittest.main()
