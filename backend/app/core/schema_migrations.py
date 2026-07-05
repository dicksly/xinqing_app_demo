"""Small runtime schema guards for beta deployments without Alembic."""

from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


PUBLIC_BETA_COLUMNS = {
    "emotion_records": [
        ("client_id", "VARCHAR(120) NOT NULL DEFAULT 'anonymous'", "ix_emotion_records_client_id"),
    ],
    "mindfulness_sessions": [
        ("client_id", "VARCHAR(120) NOT NULL DEFAULT 'anonymous'", "ix_mindfulness_sessions_client_id"),
    ],
    "treehole_entries": [
        ("client_id", "VARCHAR(120) NOT NULL DEFAULT 'anonymous'", "ix_treehole_entries_client_id"),
    ],
}


def ensure_public_beta_schema(engine: Engine) -> None:
    """Add public-beta ownership columns to existing databases."""
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())

    with engine.begin() as conn:
        for table_name, columns in PUBLIC_BETA_COLUMNS.items():
            if table_name not in existing_tables:
                continue

            existing_columns = {
                column["name"]
                for column in inspector.get_columns(table_name)
            }
            existing_indexes = {
                index["name"]
                for index in inspector.get_indexes(table_name)
            }

            for column_name, column_ddl, index_name in columns:
                if column_name not in existing_columns:
                    conn.execute(text(
                        f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_ddl}"
                    ))

                if index_name not in existing_indexes:
                    conn.execute(text(
                        f"CREATE INDEX {index_name} ON {table_name} ({column_name})"
                    ))
