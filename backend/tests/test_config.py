import unittest
import importlib
import sys
from pathlib import Path

from app.core.config import Settings


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


if __name__ == "__main__":
    unittest.main()
