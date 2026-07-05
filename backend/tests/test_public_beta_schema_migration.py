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

            engine.dispose()


if __name__ == "__main__":
    unittest.main()
