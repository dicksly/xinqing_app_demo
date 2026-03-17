import sqlite3
import tempfile
import unittest
from pathlib import Path


class KnowledgeSchemaMigrationTests(unittest.TestCase):
    def test_migration_adds_missing_knowledge_content_columns(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "knowledge.db"
            conn = sqlite3.connect(db_path)
            conn.execute(
                """
                CREATE TABLE knowledge_contents (
                    id INTEGER PRIMARY KEY,
                    title VARCHAR(255),
                    content_type VARCHAR(20),
                    content TEXT,
                    category VARCHAR(50),
                    tags TEXT,
                    view_count INTEGER,
                    created_at DATETIME
                )
                """
            )
            conn.commit()
            conn.close()

            from main import ensure_knowledge_schema

            ensure_knowledge_schema(db_path)

            conn = sqlite3.connect(db_path)
            columns = {
                row[1]: row[2]
                for row in conn.execute("PRAGMA table_info(knowledge_contents)").fetchall()
            }
            conn.close()

            self.assertIn("summary", columns)
            self.assertIn("cover_url", columns)
            self.assertIn("external_url", columns)
            self.assertIn("locale", columns)
            self.assertIn("status", columns)
            self.assertIn("sort_order", columns)
            self.assertIn("published_at", columns)
            self.assertIn("updated_at", columns)


if __name__ == "__main__":
    unittest.main()
