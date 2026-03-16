import unittest
from tempfile import TemporaryDirectory

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.models import DailyQuote, KnowledgeContent, KnowledgeTopic


class KnowledgeSeedTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = TemporaryDirectory()
        database_url = f"sqlite:///{self.temp_dir.name}/knowledge-seed.db"
        self.engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )
        self.session_local = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=self.engine,
        )
        Base.metadata.create_all(bind=self.engine)

    def tearDown(self):
        Base.metadata.drop_all(bind=self.engine)
        self.engine.dispose()
        self.temp_dir.cleanup()

    def test_seed_inserts_default_quote_content_and_topics_when_tables_are_empty(self):
        from app.data.seed_knowledge_content import seed_knowledge_content

        db = self.session_local()
        try:
            seed_knowledge_content(db)

            self.assertGreater(db.query(DailyQuote).count(), 0)
            self.assertGreater(db.query(KnowledgeContent).count(), 0)
            self.assertGreater(db.query(KnowledgeTopic).count(), 0)
        finally:
            db.close()

    def test_seed_does_not_duplicate_rows_on_repeated_runs(self):
        from app.data.seed_knowledge_content import seed_knowledge_content

        db = self.session_local()
        try:
            seed_knowledge_content(db)
            first_counts = (
                db.query(DailyQuote).count(),
                db.query(KnowledgeContent).count(),
                db.query(KnowledgeTopic).count(),
            )

            seed_knowledge_content(db)
            second_counts = (
                db.query(DailyQuote).count(),
                db.query(KnowledgeContent).count(),
                db.query(KnowledgeTopic).count(),
            )

            self.assertEqual(first_counts, second_counts)
        finally:
            db.close()


if __name__ == "__main__":
    unittest.main()
