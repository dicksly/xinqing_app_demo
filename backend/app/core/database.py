"""
数据库配置
"""

import os
from collections.abc import Mapping

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

try:
    from .persistent import DATABASE_URL as PERSISTENT_DATABASE_URL
except ImportError:
    PERSISTENT_DATABASE_URL = settings.DATABASE_URL

def resolve_database_url(
    env: Mapping[str, str] | None = None,
    configured_url: str | None = None,
    fallback_url: str | None = None,
) -> str:
    """Resolve the database URL, preferring explicit deployment config."""
    current_env = os.environ if env is None else env
    explicit_url = current_env.get("DATABASE_URL")
    if explicit_url:
        return explicit_url

    configured = settings.DATABASE_URL if configured_url is None else configured_url
    fallback = PERSISTENT_DATABASE_URL if fallback_url is None else fallback_url

    if configured:
        return configured

    return fallback


def is_sqlite_database_url(database_url: str) -> bool:
    """Return whether SQLAlchemy URL points to SQLite."""
    return make_url(database_url).get_backend_name() == "sqlite"


def build_engine_options(database_url: str, debug: bool) -> dict:
    """Build SQLAlchemy create_engine options for the selected backend."""
    options = {"echo": debug}

    if is_sqlite_database_url(database_url):
        options["connect_args"] = {"check_same_thread": False}
        return options

    options["pool_pre_ping"] = True

    backend_name = make_url(database_url).get_backend_name()
    if backend_name in {"mysql", "mariadb"}:
        options["pool_recycle"] = 280
        options["pool_size"] = 5
        options["max_overflow"] = 10

    return options


DATABASE_URL = resolve_database_url()
settings.DATABASE_URL = DATABASE_URL

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    **build_engine_options(DATABASE_URL, debug=settings.DEBUG),
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基类
Base = declarative_base()


def get_db():
    """
    数据库依赖注入函数
    用于 FastAPI 路由中获取数据库会话
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
