import unittest
from pathlib import Path


class LifespanMigrationTests(unittest.TestCase):
    def test_main_module_uses_lifespan_instead_of_on_event(self):
        main_source = (
            Path(__file__).resolve().parents[1] / "main.py"
        ).read_text(encoding="utf-8")

        self.assertIn("asynccontextmanager", main_source)
        self.assertIn("lifespan=lifespan", main_source)
        self.assertNotIn('@app.on_event("startup")', main_source)


if __name__ == "__main__":
    unittest.main()
