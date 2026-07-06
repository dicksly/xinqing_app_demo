import tempfile
import unittest
from pathlib import Path

from sqlalchemy import create_engine, inspect, text

from app.core.schema_migrations import ensure_public_beta_schema


class PublicBetaSchemaMigrationTests(unittest.TestCase):
    def test_migration_adds_client_id_columns_to_existing_tables(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            db_path = Path(tmpdir) / "beta-schema.db"
            engine = create_engine(f"sqlite:///{db_path}")
            with engine.begin() as conn:
                conn.execute(text(
                    "CREATE TABLE emotion_records (id INTEGER PRIMARY KEY, mood VARCHAR(50))"
                ))
                conn.execute(text(
                    "CREATE TABLE mindfulness_sessions (id INTEGER PRIMARY KEY, session_type VARCHAR(50))"
                ))
                conn.execute(text(
                    "CREATE TABLE treehole_entries (id INTEGER PRIMARY KEY, content TEXT)"
                ))
                conn.execute(text(
                    """
                    CREATE TABLE psychological_assessments (
                        id INTEGER PRIMARY KEY,
                        client_id VARCHAR(120),
                        consent_version VARCHAR(80),
                        consent_usage TEXT,
                        consent_accepted BOOLEAN,
                        user_signature VARCHAR(120),
                        is_minor BOOLEAN,
                        guardian_signature VARCHAR(120),
                        answers TEXT,
                        score INTEGER,
                        level VARCHAR(20),
                        diagnosis TEXT,
                        suggestions TEXT,
                        created_at DATETIME
                    )
                    """
                ))

            ensure_public_beta_schema(engine)

            inspector = inspect(engine)
            for table_name in (
                "emotion_records",
                "mindfulness_sessions",
                "treehole_entries",
            ):
                columns = {column["name"] for column in inspector.get_columns(table_name)}
                indexes = {index["name"] for index in inspector.get_indexes(table_name)}

                self.assertIn("client_id", columns)
                self.assertIn(f"ix_{table_name}_client_id", indexes)

            treehole_columns = {
                column["name"]
                for column in inspector.get_columns("treehole_entries")
            }
            self.assertIn("image_data", treehole_columns)
            self.assertIn("voice_data", treehole_columns)
            self.assertIn("duration", treehole_columns)

            assessment_columns = {
                column["name"]
                for column in inspector.get_columns("psychological_assessments")
            }
            for column_name in (
                "scale_version",
                "raw_answers",
                "scored_answers",
                "subscale_scores",
                "max_score",
                "wellness_state",
            ):
                self.assertIn(column_name, assessment_columns)

            engine.dispose()


if __name__ == "__main__":
    unittest.main()
