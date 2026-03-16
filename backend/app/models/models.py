"""
数据库模型定义
"""

from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class EmotionRecord(Base):
    """情绪记录表"""
    
    __tablename__ = "emotion_records"
    
    id = Column(Integer, primary_key=True, index=True)
    mood = Column(String(50))  # 心情：焦虑、丧、平静、开心、元气
    energy_level = Column(Float)  # 能量水平 0-100
    sleep_quality = Column(Integer)  # 睡眠质量 1-5星
    stress_sources = Column(Text)  # 压力源（JSON字符串）
    social_preference = Column(String(20))  # 社交意愿：alone/social
    happy_moment = Column(Text)  # 微光时刻
    happy_moment_type = Column(String(20))  # 微光时刻类型：text/voice/image
    happy_moment_media_path = Column(String(255), nullable=True)  # 媒体文件路径
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MindfulnessSession(Base):
    """正念练习记录表"""
    
    __tablename__ = "mindfulness_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_type = Column(String(50))  # 练习类型：sleep/wake/stress/emergency
    duration_minutes = Column(Integer)  # 时长（分钟）
    completed = Column(Boolean, default=False)  # 是否完成
    created_at = Column(DateTime, default=datetime.utcnow)


class TreeholeEntry(Base):
    """秘密树洞条目表"""
    
    __tablename__ = "treehole_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    content_type = Column(String(20))  # 内容类型：text/voice/image
    content = Column(Text)  # 文字内容
    media_path = Column(String(255), nullable=True)  # 媒体文件路径
    image_data = Column(Text, nullable=True)  # 图片 base64 数据
    duration = Column(Integer, default=0)  # 语音时长（秒）
    is_anonymous = Column(Boolean, default=True)  # 是否匿名
    is_published = Column(Boolean, default=False)  # 是否发布到广场
    has_voice_change = Column(Boolean, default=False)  # 是否变声处理
    risk_level = Column(String(20), default="safe")  # 风险等级：safe/mild/severe
    ai_response = Column(Text, nullable=True)  # AI 回应
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeContent(Base):
    """知识库内容表"""

    __tablename__ = "knowledge_contents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))  # 标题
    content_type = Column(String(20))  # 内容类型：video/comic/test/quote
    content = Column(Text)  # 内容
    category = Column(String(50))  # 分类
    tags = Column(Text)  # 标签（JSON字符串）
    view_count = Column(Integer, default=0)  # 浏览次数
    created_at = Column(DateTime, default=datetime.utcnow)


class User(Base):
    """用户表"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)  # 用户名
    email = Column(String(100), unique=True, index=True)  # 邮箱
    password_hash = Column(String(255))  # 密码哈希
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # 关联
    game_progress = relationship("GameProgress", back_populates="user")


class AdminUser(Base):
    """后台管理员表"""

    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password_hash = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class GameProgress(Base):
    """游戏进度表"""

    __tablename__ = "game_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    game_type = Column(String(20))  # bubble, soap, organize, mandala
    total_play_count = Column(Integer, default=0)  # 总游玩次数
    total_play_time = Column(Integer, default=0)  # 总游玩时长（秒）
    unlocked_skins = Column(Text, default="[]")  # 已解锁皮肤（JSON）
    current_skin = Column(String(50), default="default")  # 当前皮肤
    stats = Column(Text, default="{}")  # 游戏特定统计（JSON）
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关联
    user = relationship("User", back_populates="game_progress")
