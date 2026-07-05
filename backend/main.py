"""
心理健康与情绪疗愈 App - 后端主入口（支持持久化存储）
技术栈：FastAPI + SQLAlchemy + Pydantic
"""

from contextlib import asynccontextmanager
import os
from pathlib import Path
import sqlite3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.core.config import settings
from app.core.database import DATABASE_URL, engine, Base, SessionLocal, is_sqlite_database_url
from app.core.schema_migrations import ensure_public_beta_schema
from app.api.v1.api import router as api_router
from app.data.seed_knowledge_content import seed_knowledge_content

try:
    from app.core.persistent import DATABASE_FILE
except ImportError:
    DATABASE_FILE = None

if is_sqlite_database_url(DATABASE_URL) and DATABASE_FILE is not None:
    print(f"✅ 使用持久化 SQLite 存储：{DATABASE_FILE}")
else:
    print(f"✅ 使用外部数据库：{engine.url.render_as_string(hide_password=True)}")


def ensure_treehole_schema(db_path: Path) -> None:
    """为旧版 SQLite 数据库补齐树洞表缺失列。"""
    if not db_path.exists():
        return

    conn = sqlite3.connect(db_path)
    try:
        columns = {
            row[1] for row in conn.execute("PRAGMA table_info(treehole_entries)").fetchall()
        }

        if not columns:
            return

        if "image_data" not in columns:
            conn.execute("ALTER TABLE treehole_entries ADD COLUMN image_data TEXT")

        if "duration" not in columns:
            conn.execute("ALTER TABLE treehole_entries ADD COLUMN duration INTEGER DEFAULT 0")

        conn.commit()
    finally:
        conn.close()


def ensure_knowledge_schema(db_path: Path) -> None:
    """为旧版 SQLite 数据库补齐知识内容表缺失列。"""
    if not db_path.exists():
        return

    conn = sqlite3.connect(db_path)
    try:
        columns = {
            row[1] for row in conn.execute("PRAGMA table_info(knowledge_contents)").fetchall()
        }

        if not columns:
            return

        if "summary" not in columns:
            conn.execute("ALTER TABLE knowledge_contents ADD COLUMN summary TEXT")

        if "cover_url" not in columns:
            conn.execute("ALTER TABLE knowledge_contents ADD COLUMN cover_url VARCHAR(500)")

        if "external_url" not in columns:
            conn.execute("ALTER TABLE knowledge_contents ADD COLUMN external_url VARCHAR(500)")

        if "locale" not in columns:
            conn.execute(
                "ALTER TABLE knowledge_contents ADD COLUMN locale VARCHAR(20) DEFAULT 'zh-CN'"
            )

        if "status" not in columns:
            conn.execute(
                "ALTER TABLE knowledge_contents ADD COLUMN status VARCHAR(20) DEFAULT 'draft'"
            )

        if "sort_order" not in columns:
            conn.execute(
                "ALTER TABLE knowledge_contents ADD COLUMN sort_order INTEGER DEFAULT 0"
            )

        if "published_at" not in columns:
            conn.execute("ALTER TABLE knowledge_contents ADD COLUMN published_at DATETIME")

        if "updated_at" not in columns:
            conn.execute("ALTER TABLE knowledge_contents ADD COLUMN updated_at DATETIME")

        conn.commit()
    finally:
        conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期：启动时准备数据库。"""
    if is_sqlite_database_url(DATABASE_URL) and DATABASE_FILE is not None:
        DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
        print(f"✅ 数据库目录创建成功：{DATABASE_FILE.parent}")
        ensure_treehole_schema(DATABASE_FILE)
        ensure_knowledge_schema(DATABASE_FILE)

    Base.metadata.create_all(bind=engine)
    ensure_public_beta_schema(engine)
    db = SessionLocal()
    try:
        from app.services.auth_service import ensure_default_admin_user

        ensure_default_admin_user(db)
        seed_knowledge_content(db)
    finally:
        db.close()
    print("🚀 应用启动成功！数据库表已创建")

    yield


# 创建 FastAPI 应用实例
app = FastAPI(
    title="心理健康与情绪疗愈 App API",
    description="为年轻人设计的轻量级情绪管理与心理疗愈应用后端服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api/v1")

# 挂载静态文件（前端资源）
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def root():
    """根路径，返回欢迎信息"""
    return {
        "message": "欢迎使用心理健康与情绪疗愈 App API",
        "version": "1.0.0",
        "docs": "/docs",
        "frontend": "/index.html"
    }


@app.get("/health")
async def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "environment": os.environ.get("RENDER", "development"),
        "database": str(settings.DATABASE_URL)
    }


@app.get("/storage-info")
async def storage_info():
    """存储信息端点"""
    try:
        from app.core.persistent import get_environment_info
        return get_environment_info()
    except ImportError:
        return {
            "storage": "development",
            "database": str(settings.DATABASE_URL)
        }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
