import unittest
import importlib
import sys
from pathlib import Path

from sqlalchemy.engine import make_url

from app.core.config import Settings
from app.core import database as database_module
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
            main_module.engine.url.render_as_string(hide_password=False),
            main_module.settings.DATABASE_URL,
        )

    def test_default_database_url_is_hardcoded_aliyun_mysql_public_endpoint(self):
        default_url = Settings.model_fields["DATABASE_URL"].default
        parsed_url = make_url(default_url)

        self.assertEqual(parsed_url.drivername, "mysql+pymysql")
        self.assertEqual(parsed_url.host, "rm-2zeudbxi699wy0z8llo.mysql.rds.aliyuncs.com")
        self.assertEqual(parsed_url.database, "xinqing_app")
        self.assertEqual(parsed_url.query.get("charset"), "utf8mb4")

    def test_production_env_hardcodes_aliyun_mysql_internal_endpoint(self):
        repo_root = Path(__file__).resolve().parents[2]
        production_env = repo_root / "backend" / ".env.production"
        production_content = production_env.read_text(encoding="utf-8")

        self.assertIn("mysql+pymysql://root:", production_content)
        self.assertIn("rm-2zeudbxi699wy0z8l.mysql.rds.aliyuncs.com", production_content)
        self.assertIn("xinqing_app?charset=utf8mb4", production_content)
        self.assertNotIn("CHANGE_ME", production_content)

    def test_database_url_uses_hardcoded_default_before_sqlite_fallback(self):
        hardcoded_default = Settings.model_fields["DATABASE_URL"].default
        fallback_url = "sqlite:////opt/render/project/xinqing.db"

        resolved_url = database_module.resolve_database_url(
            {},
            configured_url=hardcoded_default,
            fallback_url=fallback_url,
        )

        self.assertEqual(resolved_url, hardcoded_default)

    def test_database_url_prefers_explicit_environment_url(self):
        mysql_url = (
            "mysql+pymysql://user:password@rm-example.mysql.rds.aliyuncs.com:3306/"
            "xinqing_app?charset=utf8mb4"
        )

        resolved_url = database_module.resolve_database_url(
            {"DATABASE_URL": mysql_url},
            configured_url="sqlite:///./xinqing.db",
            fallback_url="sqlite:////opt/render/project/xinqing.db",
        )

        self.assertEqual(resolved_url, mysql_url)

    def test_mysql_engine_options_do_not_include_sqlite_connect_args(self):
        mysql_url = (
            "mysql+pymysql://user:password@rm-example.mysql.rds.aliyuncs.com:3306/"
            "xinqing_app?charset=utf8mb4"
        )

        engine_options = database_module.build_engine_options(mysql_url, debug=False)

        self.assertNotIn("connect_args", engine_options)
        self.assertTrue(engine_options["pool_pre_ping"])

    def test_sqlite_engine_options_keep_thread_override(self):
        engine_options = database_module.build_engine_options("sqlite:///./xinqing.db", debug=False)

        self.assertEqual(engine_options["connect_args"], {"check_same_thread": False})

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
            voiceData="data:audio/webm;base64,abc",
            duration=18,
            hasVoiceChange=True,
            isPublished=True,
            isAnonymous=True,
        )

        self.assertEqual(entry.content, "今天很累，但也拍了晚霞。")
        self.assertEqual(entry.image_data, "data:image/png;base64,abc")
        self.assertEqual(entry.voice_data, "data:audio/webm;base64,abc")
        self.assertEqual(entry.duration, 18)


if __name__ == "__main__":
    unittest.main()
