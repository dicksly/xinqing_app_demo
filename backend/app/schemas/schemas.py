"""
Pydantic Schemas - 用于数据验证和序列化
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class EmotionRecordBase(BaseModel):
    """情绪记录基础 Schema"""
    mood: str = Field(..., description="心情：焦虑、丧、平静、开心、元气")
    energy_level: float = Field(..., ge=0, le=100, description="能量水平 0-100")
    sleep_quality: int = Field(..., ge=1, le=5, description="睡眠质量 1-5星")
    stress_sources: Optional[str] = Field(None, description="压力源（JSON字符串）")
    social_preference: Optional[str] = Field(None, description="社交意愿：alone/social")
    happy_moment: Optional[str] = Field(None, max_length=50, description="微光时刻（最多50字）")
    happy_moment_type: Optional[str] = Field(None, description="微光时刻类型：text/voice/image")


class EmotionRecordCreate(EmotionRecordBase):
    """创建情绪记录"""
    pass


class EmotionRecordResponse(EmotionRecordBase):
    """情绪记录响应"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class MindfulnessSessionBase(BaseModel):
    """正念练习基础 Schema"""
    session_type: str = Field(..., description="练习类型：sleep/wake/stress/emergency")
    duration_minutes: int = Field(..., description="时长（分钟）")


class MindfulnessSessionCreate(MindfulnessSessionBase):
    """创建正念练习记录"""
    pass


class MindfulnessSessionResponse(MindfulnessSessionBase):
    """正念练习响应"""
    id: int
    completed: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TreeholeEntryBase(BaseModel):
    """秘密树洞基础 Schema"""
    content_type: str = Field(..., description="内容类型：text/voice/image")
    content: Optional[str] = Field(None, description="文字内容")
    has_voice_change: Optional[bool] = Field(False, description="是否变声处理")


class TreeholeEntryCreate(TreeholeEntryBase):
    """创建树洞条目"""
    pass


class TreeholeEntryResponse(TreeholeEntryBase):
    """树洞条目响应"""
    id: int
    is_anonymous: bool
    is_published: bool
    risk_level: str
    ai_response: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class KnowledgeContentBase(BaseModel):
    """知识库内容基础 Schema"""
    title: str = Field(..., description="标题")
    content_type: str = Field(..., description="内容类型：video/comic/test/quote")
    content: str = Field(..., description="内容")
    category: str = Field(..., description="分类")
    tags: Optional[str] = Field(None, description="标签（JSON字符串）")


class KnowledgeContentResponse(KnowledgeContentBase):
    """知识库内容响应"""
    id: int
    view_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class WeeklyReportResponse(BaseModel):
    """周报响应"""
    total_records: int
    mood_distribution: dict
    average_energy: float
    average_sleep: float
    top_stress_sources: List[str]
    happy_moments_count: int
