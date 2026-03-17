"""
数据库配置
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

try:
    from .persistent import DATABASE_URL as PERSISTENT_DATABASE_URL
except ImportError:
    PERSISTENT_DATABASE_URL = settings.DATABASE_URL

DATABASE_URL = PERSISTENT_DATABASE_URL
settings.DATABASE_URL = DATABASE_URL

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 特定配置
    echo=settings.DEBUG  # 开发环境打印 SQL
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
