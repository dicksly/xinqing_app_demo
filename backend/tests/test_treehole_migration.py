import sqlite3
import tempfile
import unittest
from pathlib import Path


class TreeholeMigrationTests(unittest.TestCase):
    def test_migration_adds_missing_treehole_columns(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "treehole.db"
            conn = sqlite3.connect(db_path)
            conn.execute(
                """
                CREATE TABLE treehole_entries (
                    id INTEGER PRIMARY KEY,
                    content_type VARCHAR(20),
                    content TEXT,
                    media_path VARCHAR(255),
                    is_anonymous BOOLEAN,
                    is_published BOOLEAN,
                    has_voice_change BOOLEAN,
                    risk_level VARCHAR(20),
                    ai_response TEXT,
                    created_at DATETIME
                )
                """
            )
            conn.commit()
            conn.close()

            from main import ensure_treehole_schema

            ensure_treehole_schema(db_path)

            conn = sqlite3.connect(db_path)
            columns = {
                row[1]: row[2]
                for row in conn.execute("PRAGMA table_info(treehole_entries)").fetchall()
            }
            conn.close()

            self.assertIn("image_data", columns)
            self.assertIn("voice_data", columns)
            self.assertIn("duration", columns)


if __name__ == "__main__":
    unittest.main()
