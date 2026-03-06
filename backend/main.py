"""
心理健康与情绪疗愈 App - 后端主入口
技术栈：FastAPI + SQLAlchemy + Pydantic
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from app.api.v1 import api_router
from app.core.config import settings
from app.core.database import engine, Base

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
    allow_origins=["*"],  # 生产环境应限制具体域名
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
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )
