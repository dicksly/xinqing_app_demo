"""
后端配置文件
"""

from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional
from functools import cached_property


ALIYUN_MYSQL_PUBLIC_DATABASE_URL = (
    "mysql+pymysql://root:Dicksly-65745475@"
    "rm-2zeudbxi699wy0z8llo.mysql.rds.aliyuncs.com:3306/"
    "xinqing_app?charset=utf8mb4"
)

ALIYUN_MYSQL_INTERNAL_DATABASE_URL = (
    "mysql+pymysql://root:Dicksly-65745475@"
    "rm-2zeudbxi699wy0z8l.mysql.rds.aliyuncs.com:3306/"
    "xinqing_app?charset=utf8mb4"
)


class Settings(BaseSettings):
    """应用配置"""

    model_config = {
        "env_file": Path(__file__).resolve().parents[2] / ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }
    
    # 应用基础配置
    APP_NAME: str = "心理健康与情绪疗愈 App"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 数据库配置
    DATABASE_URL: str = ALIYUN_MYSQL_PUBLIC_DATABASE_URL
    
    # JWT 配置（如果需要认证）
    SECRET_KEY: str = "xinqing-public-beta-jwt-secret-2026-07-06-change-after-beta"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    
    # 加密密钥
    ENCRYPTION_KEY: str = "xinqing-public-beta-data-key-2026-07-06-change-after-beta"
    
    # CORS 配置（生产环境必须配置）
    ALLOWED_ORIGINS: str = "*"  # 默认允许所有来源，生产环境应设置为前端域名
    ADMIN_BOOTSTRAP_USERNAME: str = "admin"
    ADMIN_BOOTSTRAP_PASSWORD: str = "XinqingBeta2026!"
    ENABLE_DEMO_PASSWORD_RESET: bool = False
    AI_API_KEY: Optional[str] = None
    AI_API_BASE: Optional[str] = None
    AI_MODEL: str = "Pro/deepseek-ai/DeepSeek-V3.2"
    
    # 文件上传配置
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: str = "image/jpeg,image/png,image/gif"
    ALLOWED_AUDIO_TYPES: str = "audio/mpeg,audio/wav,audio/ogg"
    
    # 分页配置
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    @cached_property
    def allowed_origins_list(self) -> list[str]:
        """将逗号分隔的 CORS 配置标准化为列表。"""
        origins = self.ALLOWED_ORIGINS

        if isinstance(origins, str):
            normalized = [origin.strip() for origin in origins.split(",") if origin.strip()]
            return normalized or ["*"]

        return list(origins or ["*"])

    @cached_property
    def cors_allow_credentials(self) -> bool:
        """通配来源时禁用 credentials，避免违反 CORS 规范。"""
        return self.allowed_origins_list != ["*"]

    @cached_property
    def allowed_image_types_list(self) -> list[str]:
        return [item.strip() for item in self.ALLOWED_IMAGE_TYPES.split(",") if item.strip()]

    @cached_property
    def allowed_audio_types_list(self) -> list[str]:
        return [item.strip() for item in self.ALLOWED_AUDIO_TYPES.split(",") if item.strip()]


settings = Settings()
