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
