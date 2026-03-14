import unittest
from pathlib import Path


class DeprecationCleanupTests(unittest.TestCase):
    def test_schemas_use_pydantic_v2_model_config(self):
        schema_source = (
            Path(__file__).resolve().parents[1] / "app" / "schemas" / "schemas.py"
        ).read_text(encoding="utf-8")

        self.assertNotIn("class Config:", schema_source)
        self.assertIn("ConfigDict", schema_source)

    def test_api_routes_do_not_use_from_orm(self):
        api_source = (
            Path(__file__).resolve().parents[1] / "app" / "api" / "v1" / "api.py"
        ).read_text(encoding="utf-8")

        self.assertNotIn(".from_orm(", api_source)
        self.assertIn(".model_validate(", api_source)

    def test_database_module_uses_sqlalchemy_orm_declarative_base(self):
        database_source = (
            Path(__file__).resolve().parents[1] / "app" / "core" / "database.py"
        ).read_text(encoding="utf-8")

        self.assertIn(
            "from sqlalchemy.orm import declarative_base, sessionmaker",
            database_source,
        )
        self.assertNotIn(
            "from sqlalchemy.ext.declarative import declarative_base",
            database_source,
        )


if __name__ == "__main__":
    unittest.main()
