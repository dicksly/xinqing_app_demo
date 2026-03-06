"""
心理健康与情绪疗愈 App - 后端主入口（支持持久化存储）
技术栈：FastAPI + SQLAlchemy + Pydantic
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import engine, Base

# 导入持久化存储配置
try:
    from app.core.persistent import DATABASE_FILE, DATABASE_URL
    # 如果持久化存储配置存在，使用持久化存储
    settings.DATABASE_URL = DATABASE_URL
    print(f"✅ 使用持久化存储：{DATABASE_FILE}")
except ImportError:
    print("ℹ 使用开发环境存储（临时）")

# 创建 FastAPI 应用实例
app = FastAPI(
    title="心理健康与情绪疗愈 App API",
    description="为年轻人设计的轻量级情绪管理与心理疗愈应用后端服务",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api/v1")

# 挂载静态文件（前端资源）
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.on_event("startup")
async def startup_event():
    """应用启动时创建数据库表"""
    
    # 确保数据库目录存在
    try:
        from app.core.persistent import DATABASE_FILE
        DATABASE_FILE.parent.mkdir(parents=True, exist_ok=True)
        print(f"✅ 数据库目录创建成功：{DATABASE_FILE.parent}")
    except:
        # 开发环境，使用默认路径
        pass
    
    # 创建数据库表
    Base.metadata.create_all(bind=engine)
    print("🚀 应用启动成功！数据库表已创建")


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
