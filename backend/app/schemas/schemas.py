"""
Pydantic Schemas - 用于数据验证和序列化
"""

from pydantic import BaseModel, ConfigDict, Field, AliasChoices, model_validator
from typing import Optional, List
from datetime import date, datetime


class EmotionRecordBase(BaseModel):
    """情绪记录基础 Schema"""
    mood: str = Field(..., description="心情：焦虑、丧、平静、开心、元气")
    energy_level: float = Field(
        ...,
        ge=0,
        le=100,
        description="能量水平 0-100",
        validation_alias=AliasChoices("energy_level", "energyLevel"),
    )
    sleep_quality: int = Field(
        ...,
        ge=1,
        le=5,
        description="睡眠质量 1-5星",
        validation_alias=AliasChoices("sleep_quality", "sleepQuality"),
    )
    stress_sources: Optional[str] = Field(
        None,
        description="压力源（JSON字符串）",
        validation_alias=AliasChoices("stress_sources", "stressSources"),
    )
    social_preference: Optional[str] = Field(
        None,
        description="社交意愿：alone/social",
        validation_alias=AliasChoices("social_preference", "socialPreference"),
    )
    happy_moment: Optional[str] = Field(
        None,
        max_length=50,
        description="微光时刻（最多50字）",
        validation_alias=AliasChoices("happy_moment", "happyMoment"),
    )
    happy_moment_type: Optional[str] = Field(
        None,
        description="微光时刻类型：text/voice/image",
        validation_alias=AliasChoices("happy_moment_type", "happyMomentType"),
    )


class EmotionRecordCreate(EmotionRecordBase):
    """创建情绪记录"""
    pass


class EmotionRecordResponse(EmotionRecordBase):
    """情绪记录响应"""
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


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
    model_config = ConfigDict(from_attributes=True)


class TreeholeEntryBase(BaseModel):
    """秘密树洞基础 Schema"""
    content_type: Optional[str] = Field(
        None,
        description="内容类型：text/voice/image",
        validation_alias=AliasChoices("content_type", "contentType"),
    )
    content: Optional[str] = Field(None, description="文字内容")
    has_voice_change: Optional[bool] = Field(
        False,
        description="是否变声处理",
        validation_alias=AliasChoices("has_voice_change", "hasVoiceChange"),
    )
    image_data: Optional[str] = Field(
        None,
        description="图片 base64 数据",
        validation_alias=AliasChoices("image_data", "imageData"),
    )
    duration: Optional[int] = Field(
        0,
        description="语音时长（秒）",
    )
    
    @model_validator(mode="after")
    def validate_content_presence(self):
        has_text = bool((self.content or "").strip())
        has_image = bool(self.image_data)
        has_voice = bool((self.duration or 0) > 0)

        if not any([has_text, has_image, has_voice]):
            raise ValueError("至少需要提供文字、图片或语音中的一种内容")

        if not self.content_type:
            if has_text:
                self.content_type = "text"
            elif has_voice:
                self.content_type = "voice"
            else:
                self.content_type = "image"

        return self


class TreeholeEntryCreate(TreeholeEntryBase):
    """创建树洞条目"""
    is_anonymous: Optional[bool] = Field(
        True,
        description="是否匿名发布",
        validation_alias=AliasChoices("is_anonymous", "isAnonymous"),
    )
    is_published: Optional[bool] = Field(
        False,
        description="是否发布到广场",
        validation_alias=AliasChoices("is_published", "isPublished"),
    )


class TreeholeEntryResponse(TreeholeEntryBase):
    """树洞条目响应"""
    id: int
    is_anonymous: bool
    is_published: bool
    risk_level: str
    ai_response: Optional[str]
    image_data: Optional[str] = None
    duration: int = 0
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class KnowledgeContentBase(BaseModel):
    """知识库内容基础 Schema"""
    title: str = Field(..., description="标题")
    summary: Optional[str] = Field(None, description="摘要")
    content_type: str = Field(..., description="内容类型：video/article")
    content: str = Field(..., description="内容")
    category: str = Field(..., description="分类")
    cover_url: Optional[str] = Field(None, description="封面图")
    external_url: Optional[str] = Field(None, description="外部链接")
    tags: Optional[str] = Field(None, description="标签（JSON字符串）")
    status: str = Field("draft", description="状态")
    sort_order: int = Field(0, description="排序")
    locale: str = Field("zh-CN", description="语言")
    published_at: Optional[datetime] = Field(None, description="发布时间")


class KnowledgeContentCreate(KnowledgeContentBase):
    """创建知识内容"""
    pass


class KnowledgeContentUpdate(KnowledgeContentBase):
    """更新知识内容"""
    pass


class KnowledgeContentResponse(KnowledgeContentBase):
    """知识库内容响应"""
    id: int
    view_count: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class DailyQuoteBase(BaseModel):
    """每日金句基础 Schema"""
    text: str = Field(..., description="金句内容")
    author: Optional[str] = Field(None, description="作者")
    locale: str = Field("zh-CN", description="语言")
    status: str = Field("draft", description="状态")
    sort_order: int = Field(0, description="排序")
    effective_date: Optional[date] = Field(None, description="生效日期")


class DailyQuoteCreate(DailyQuoteBase):
    """创建每日金句"""
    pass


class DailyQuoteUpdate(DailyQuoteBase):
    """更新每日金句"""
    pass


class DailyQuoteResponse(DailyQuoteBase):
    """每日金句响应"""
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class KnowledgeTopicBase(BaseModel):
    """知识专题基础 Schema"""
    title: str = Field(..., description="专题标题")
    description: Optional[str] = Field(None, description="专题描述")
    status: str = Field("draft", description="状态")
    content_count: int = Field(0, description="内容数量")
    locale: str = Field("zh-CN", description="语言")
    sort_order: int = Field(0, description="排序")


class KnowledgeTopicCreate(KnowledgeTopicBase):
    """创建知识专题"""
    pass


class KnowledgeTopicUpdate(KnowledgeTopicBase):
    """更新知识专题"""
    pass


class KnowledgeTopicResponse(KnowledgeTopicBase):
    """知识专题响应"""
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class WeeklyReportResponse(BaseModel):
    """周报响应"""
    total_records: int
    mood_distribution: dict
    average_energy: float
    average_sleep: float
    top_stress_sources: List[str]
    happy_moments_count: int


# ============ 用户认证相关 Schema ============

class UserCreate(BaseModel):
    """用户注册"""
    username: str = Field(..., min_length=3, max_length=50, description="用户名")
    email: Optional[str] = Field(None, description="邮箱（可选）")
    password: str = Field(..., min_length=6, max_length=100, description="密码")


class UserLogin(BaseModel):
    """用户登录"""
    username: str = Field(..., description="用户名")
    password: str = Field(..., description="密码")


class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: str
    email: str
    created_at: datetime
    last_login: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AdminLogin(BaseModel):
    """管理员登录"""
    username: str = Field(..., description="管理员用户名")
    password: str = Field(..., description="管理员密码")


class AdminUserResponse(BaseModel):
    """管理员信息响应"""
    id: int
    username: str
    created_at: datetime
    last_login: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class AdminTokenResponse(BaseModel):
    """管理员 Token 响应"""
    access_token: str
    token_type: str = "bearer"
    user: AdminUserResponse


# ============ 游戏进度相关 Schema ============

class GameProgressBase(BaseModel):
    """游戏进度基础 Schema"""
    game_type: str = Field(..., description="游戏类型：bubble/soap/organize/mandala")


class GameProgressUpdate(BaseModel):
    """更新游戏进度"""
    total_play_count: Optional[int] = None
    total_play_time: Optional[int] = None
    unlocked_skins: Optional[List[str]] = None
    current_skin: Optional[str] = None
    stats: Optional[dict] = None


class GameProgressResponse(BaseModel):
    """游戏进度响应"""
    id: int
    game_type: str
    total_play_count: int
    total_play_time: int
    unlocked_skins: List[str]
    current_skin: str
    stats: dict
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class GameSyncRequest(BaseModel):
    """批量同步游戏数据请求"""
    progress_list: List[dict] = Field(..., description="游戏进度列表")


class GameRecordCreate(BaseModel):
    """记录游戏会话"""
    game_type: str = Field(..., description="游戏类型")
    play_time: int = Field(..., description="本次游玩时长（秒）")
    stats: Optional[dict] = Field(None, description="本次游戏统计")
