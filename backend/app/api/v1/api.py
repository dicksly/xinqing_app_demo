"""
API v1 路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import re
import uuid

from ...core.database import get_db
from ...core.config import settings
from ...models.models import (
    AdminUser,
    DailyQuote,
    EngagementState,
    EmotionRecord,
    KnowledgeTopic,
    MindfulnessSession,
    PsychologicalAssessment,
    TreeholeEntry,
    KnowledgeContent,
    User,
    GameProgress,
)
from ...schemas.schemas import (
    EmotionRecordCreate, EmotionRecordResponse,
    MindfulnessSessionCreate, MindfulnessSessionResponse,
    EngagementCheckInCreate, EngagementCheckInResponse,
    EmotionInsightResponse,
    PsychologicalAssessmentCreate, PsychologicalAssessmentResponse,
    MindfulnessThemeResponse,
    SoapRoundRequest, SoapRoundResponse,
    TreeholeEntryCreate, TreeholeEntryResponse,
    DailyQuoteCreate, DailyQuoteUpdate, DailyQuoteResponse,
    KnowledgeTopicCreate, KnowledgeTopicUpdate, KnowledgeTopicResponse,
    KnowledgeContentCreate, KnowledgeContentUpdate, KnowledgeContentResponse,
    WeeklyReportResponse,
    UserCreate, UserLogin, UserResponse, TokenResponse,
    PasswordResetRequest, PasswordResetRequestResponse, PasswordResetConfirm,
    AdminLogin, AdminUserResponse, AdminTokenResponse,
    GameProgressUpdate, GameProgressResponse, GameSyncRequest, GameRecordCreate
)
from ...services.emotion_service import EmotionService
from ...services.ai_service import AIService
from ...services.auth_service import (
    verify_password, get_password_hash, create_access_token,
    ensure_default_admin_user,
    get_current_user, get_current_user_required,
    get_current_admin_user_required,
)
from datetime import date, datetime, timedelta

router = APIRouter()

# 初始化服务
emotion_service = EmotionService()
ai_service = AIService()

CONSENT_VERSION = "2026-05-anonymized-research-product-business"
CONSENT_USAGE = "匿名化后用于研究/产品分析/商业合作"
PASSWORD_RESET_EXPIRES_MINUTES = 15
PASSWORD_RESET_CODES = {}

MASCOT_LEVELS = [
    {
        "days": 1,
        "level": "new-sprout",
        "color": "sprout-green",
        "accessories": [],
        "actions": ["wave"],
    },
    {
        "days": 20,
        "level": "steady-sprout",
        "color": "matcha",
        "accessories": ["sage-cape"],
        "actions": ["wave", "deep-breath"],
    },
    {
        "days": 50,
        "level": "warm-sprout",
        "color": "sunrise-yellow",
        "accessories": ["sage-cape", "star-pin"],
        "actions": ["wave", "deep-breath", "stretch"],
    },
    {
        "days": 100,
        "level": "guardian-sprout",
        "color": "aurora",
        "accessories": ["sage-cape", "star-pin", "tiny-crown"],
        "actions": ["wave", "deep-breath", "stretch", "spin"],
    },
]

MOOD_EXPRESSIONS = {
    "焦虑": "worried",
    "丧": "sad",
    "平静": "calm",
    "开心": "smile",
    "元气": "spark",
}

MOOD_INSIGHTS = {
    "焦虑": {
        "tag": "需要安稳",
        "comfort": "先把呼吸放慢一点，你不用马上解决所有事。",
    },
    "丧": {
        "tag": "需要陪伴",
        "comfort": "今天能记录下来已经很不容易，先允许自己慢一点。",
    },
    "平静": {
        "tag": "状态稳定",
        "comfort": "这份平静值得被看见，可以把它留给今天的自己。",
    },
    "开心": {
        "tag": "能量回升",
        "comfort": "把这个小小的好心情收好，它也是你的资源。",
    },
    "元气": {
        "tag": "活力充足",
        "comfort": "今天的你很有力量，也记得给自己留一点休息空间。",
    },
}

MONTHLY_MINDFULNESS_THEMES = [
    {"month": 1, "key": "snow-breath", "name": "雪夜呼吸", "description": "安静、低频、适合睡前冥想", "audio_url": "/audio/monthly/01-snow-breath.mp3"},
    {"month": 2, "key": "warm-letter", "name": "暖信低语", "description": "柔和人声氛围，适合自我接纳", "audio_url": "/audio/monthly/02-warm-letter.mp3"},
    {"month": 3, "key": "spring-rain", "name": "春雨新芽", "description": "细雨与轻木琴，适合晨间冥想", "audio_url": "/audio/monthly/03-spring-rain.mp3"},
    {"month": 4, "key": "cloud-walk", "name": "云上散步", "description": "空气感合成器，适合放松身体", "audio_url": "/audio/monthly/04-cloud-walk.mp3"},
    {"month": 5, "key": "green-tea", "name": "青茶午后", "description": "清透茶室环境，适合学习间隙", "audio_url": "/audio/monthly/05-green-tea.mp3"},
    {"month": 6, "key": "summer-sea", "name": "夏日海盐", "description": "海浪和慢速节拍，适合降噪", "audio_url": "/audio/monthly/06-summer-sea.mp3"},
    {"month": 7, "key": "firefly", "name": "萤火夜路", "description": "夜虫与微光音色，适合情绪整理", "audio_url": "/audio/monthly/07-firefly.mp3"},
    {"month": 8, "key": "soft-storm", "name": "软雷雨", "description": "远雷和雨幕，适合释放压力", "audio_url": "/audio/monthly/08-soft-storm.mp3"},
    {"month": 9, "key": "paper-window", "name": "纸窗晨光", "description": "温暖弦乐，适合开学/工作重启", "audio_url": "/audio/monthly/09-paper-window.mp3"},
    {"month": 10, "key": "maple-path", "name": "枫林慢行", "description": "脚步与落叶，适合步行冥想", "audio_url": "/audio/monthly/10-maple-path.mp3"},
    {"month": 11, "key": "moon-cocoa", "name": "月光可可", "description": "低饱和钢琴，适合夜间安抚", "audio_url": "/audio/monthly/11-moon-cocoa.mp3"},
    {"month": 12, "key": "year-end-glow", "name": "年末微光", "description": "钟声与暖垫音，适合年度回望", "audio_url": "/audio/monthly/12-year-end-glow.mp3"},
]

SOAP_SKINS = {
    "default": {"color": "#8FD6C2", "label": "薄荷绿"},
    "mint": {"color": "#8FD6C2", "label": "薄荷绿"},
    "peach": {"color": "#F3A58B", "label": "蜜桃橙"},
    "lavender": {"color": "#AFA4E8", "label": "薰衣草紫"},
    "lemon": {"color": "#F1D46B", "label": "柠檬黄"},
    "ocean": {"color": "#67B7DC", "label": "海盐蓝"},
}


def get_mascot_level(streak_days: int, mood: Optional[str]) -> dict:
    unlocked = MASCOT_LEVELS[0]
    for level in MASCOT_LEVELS:
        if streak_days >= level["days"]:
            unlocked = level

    return {
        "level": unlocked["level"],
        "level_days": unlocked["days"],
        "color": unlocked["color"],
        "expression": MOOD_EXPRESSIONS.get(mood or "", "calm"),
        "unlocked_accessories": unlocked["accessories"],
        "unlocked_actions": unlocked["actions"],
    }


def get_next_mascot_level(streak_days: int) -> Optional[dict]:
    for level in MASCOT_LEVELS:
        if streak_days < level["days"]:
            return {
                "level": level["level"],
                "days": level["days"],
                "remaining_days": level["days"] - streak_days,
            }
    return None


def calculate_assessment_result(answers: dict) -> dict:
    score = (
        answers["sleep"]
        + answers["anxiety"]
        + answers["sadness"]
        + (6 - answers["energy"])
        + answers["focus"]
    )

    if score >= 14:
        return {
            "score": score,
            "level": "high",
            "tag": "高压预警",
            "diagnosis": "近期压力和情绪负担偏高，建议尽快安排一次可信任的支持性谈话或专业咨询。",
            "suggestions": ["先保证今晚的睡眠窗口", "减少高刺激信息输入", "联系可信任的人或专业支持"],
        }

    if score >= 9:
        return {
            "score": score,
            "level": "medium",
            "tag": "需要关注",
            "diagnosis": "近期状态有波动，可以通过规律作息、情绪记录和短时冥想降低负担。",
            "suggestions": ["每天记录一个压力来源", "完成 3 分钟呼吸练习", "把任务拆成更小步骤"],
        }

    return {
        "score": score,
        "level": "low",
        "tag": "状态平稳",
        "diagnosis": "当前情绪风险较低，继续保持自我观察和稳定作息。",
        "suggestions": ["保留今天有效的放松方式", "维持规律睡眠", "继续完成每日打卡"],
    }


def sanitize_treehole_content_for_public(content: Optional[str], content_type: Optional[str]) -> str:
    """Return a public-safe version of treehole content without obvious identifiers."""
    if not content or not content.strip():
        if content_type == "image":
            return "[图片内容已隐藏]"
        if content_type == "voice":
            return "[语音内容]"
        return "[内容已隐藏]"

    sanitized = content.strip()
    sanitized = re.sub(r"1[3-9]\d{9}", "[手机号已隐藏]", sanitized)
    sanitized = re.sub(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        "[邮箱已隐藏]",
        sanitized,
    )
    sanitized = re.sub(
        r"\b\d{6}(?:19|20)?\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]\b",
        "[身份证号已隐藏]",
        sanitized,
    )
    sanitized = re.sub(r"(我是|我叫)([\u4e00-\u9fff]{2,4})", r"\1[姓名已隐藏]", sanitized)
    return sanitized


def serialize_treehole_entry_for_public(entry: TreeholeEntry) -> dict:
    """Project a stored entry into the public square response shape."""
    return {
        "id": entry.id,
        "content_type": entry.content_type,
        "content": sanitize_treehole_content_for_public(entry.content, entry.content_type),
        "has_voice_change": entry.has_voice_change,
        "image_data": None,
        "duration": entry.duration or 0,
        "is_anonymous": True,
        "is_published": entry.is_published,
        "risk_level": entry.risk_level,
        "ai_response": None,
        "created_at": entry.created_at,
    }


@router.post("/emotion-records", response_model=EmotionRecordResponse)
async def create_emotion_record(
    record: EmotionRecordCreate,
    db: Session = Depends(get_db)
):
    """创建情绪记录"""
    db_record = EmotionRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record


@router.get("/emotion-records", response_model=List[EmotionRecordResponse])
async def get_emotion_records(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取情绪记录列表"""
    records = db.query(EmotionRecord).offset(skip).limit(limit).all()
    return records


@router.get("/emotion-records/weekly-report", response_model=WeeklyReportResponse)
async def get_weekly_report(db: Session = Depends(get_db)):
    """获取周报"""
    # 获取本周一的日期
    today = datetime.utcnow()
    monday = today - timedelta(days=today.weekday())
    
    # 查询本周记录
    records = db.query(EmotionRecord).filter(
        EmotionRecord.created_at >= monday
    ).all()
    
    # 计算统计信息
    total_records = len(records)
    
    if total_records == 0:
        return WeeklyReportResponse(
            total_records=0,
            mood_distribution={},
            average_energy=0,
            average_sleep=0,
            top_stress_sources=[],
            happy_moments_count=0
        )
    
    # 计算心情分布
    mood_distribution = {}
    energy_sum = 0
    sleep_sum = 0
    happy_count = 0
    
    for record in records:
        mood = record.mood or "unknown"
        mood_distribution[mood] = mood_distribution.get(mood, 0) + 1
        energy_sum += record.energy_level or 0
        sleep_sum += record.sleep_quality or 0
        if record.happy_moment:
            happy_count += 1
    
    return WeeklyReportResponse(
        total_records=total_records,
        mood_distribution=mood_distribution,
        average_energy=energy_sum / total_records if total_records > 0 else 0,
        average_sleep=sleep_sum / total_records if total_records > 0 else 0,
        top_stress_sources=emotion_service.get_top_stress_sources(records),
        happy_moments_count=happy_count
    )


@router.post("/engagement/check-in", response_model=EngagementCheckInResponse)
async def check_in_engagement(
    check_in: EngagementCheckInCreate,
    db: Session = Depends(get_db)
):
    """记录每日使用，返回连续天数和草团子解锁状态。"""
    check_in_date = check_in.check_in_date or date.today()
    state = db.query(EngagementState).filter(
        EngagementState.client_id == check_in.client_id
    ).first()

    missed_days = 0
    if state is None:
        state = EngagementState(client_id=check_in.client_id)
        db.add(state)

    if state.last_check_in_date is None:
        state.streak_days = 1
    else:
        days_since_last = (check_in_date - state.last_check_in_date).days
        if days_since_last == 0:
            state.streak_days = max(state.streak_days, 1)
        elif days_since_last == 1:
            state.streak_days += 1
        elif days_since_last > 1:
            missed_days = days_since_last - 1
            state.streak_days = 1
        else:
            state.streak_days = max(state.streak_days, 1)

    state.best_streak_days = max(state.best_streak_days or 0, state.streak_days)
    state.last_check_in_date = check_in_date
    state.last_mood = check_in.mood
    state.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(state)

    return_prompt = None
    if missed_days >= 2:
        return_prompt = f"草团子已经 {missed_days} 天没见到你啦，今天先回来坐一小会儿。"

    return EngagementCheckInResponse(
        client_id=state.client_id,
        streak_days=state.streak_days,
        best_streak_days=state.best_streak_days,
        missed_days=missed_days,
        last_check_in_date=state.last_check_in_date,
        return_prompt=return_prompt,
        mascot=get_mascot_level(state.streak_days, state.last_mood),
        next_level=get_next_mascot_level(state.streak_days),
    )


@router.get("/emotion-insights/{mood}", response_model=EmotionInsightResponse)
async def get_emotion_insight(mood: str):
    """根据心情返回打卡标签和安慰话术。"""
    insight = MOOD_INSIGHTS.get(
        mood,
        {
            "tag": "已经记录",
            "comfort": "谢谢你把今天的感受放在这里，先照顾好此刻的自己。",
        },
    )
    return EmotionInsightResponse(mood=mood, **insight)


@router.post("/psychological-assessments", response_model=PsychologicalAssessmentResponse)
async def create_psychological_assessment(
    assessment: PsychologicalAssessmentCreate,
    db: Session = Depends(get_db)
):
    """提交详细心理分析 consent form 和问卷，返回分析结果。"""
    answers = assessment.answers.model_dump()
    result = calculate_assessment_result(answers)

    db_assessment = PsychologicalAssessment(
        client_id=assessment.client_id,
        consent_version=CONSENT_VERSION,
        consent_usage=CONSENT_USAGE,
        consent_accepted=assessment.consent_accepted,
        user_signature=assessment.user_signature.strip(),
        is_minor=assessment.is_minor,
        guardian_signature=(assessment.guardian_signature or "").strip() or None,
        answers=json.dumps(answers, ensure_ascii=False),
        score=result["score"],
        level=result["level"],
        diagnosis=result["diagnosis"],
        suggestions=json.dumps(result["suggestions"], ensure_ascii=False),
    )
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)

    return PsychologicalAssessmentResponse(
        assessment_id=db_assessment.id,
        score=db_assessment.score,
        level=db_assessment.level,
        tag=result["tag"],
        diagnosis=db_assessment.diagnosis,
        suggestions=result["suggestions"],
        consent_version=db_assessment.consent_version,
        consent_usage=db_assessment.consent_usage,
        created_at=db_assessment.created_at,
    )


@router.post("/mindfulness-sessions", response_model=MindfulnessSessionResponse)
async def create_mindfulness_session(
    session: MindfulnessSessionCreate,
    db: Session = Depends(get_db)
):
    """创建正念练习记录"""
    db_session = MindfulnessSession(**session.dict())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("/mindfulness/monthly-themes", response_model=List[MindfulnessThemeResponse])
async def get_monthly_mindfulness_themes():
    """返回 12 个月主题背景音配置。"""
    return MONTHLY_MINDFULNESS_THEMES


@router.post("/treehole-entries", response_model=TreeholeEntryResponse)
async def create_treehole_entry(
    entry: TreeholeEntryCreate,
    db: Session = Depends(get_db)
):
    """创建树洞条目"""
    db_entry = TreeholeEntry(**entry.model_dump())
    
    # 风险检测
    risk_level = ai_service.detect_risk_level(db_entry.content or "")
    db_entry.risk_level = risk_level

    if risk_level == "severe":
        db_entry.is_published = False
    
    # 生成 AI 回应
    if db_entry.content:
        ai_response = ai_service.generate_response(db_entry.content, risk_level)
        db_entry.ai_response = ai_response
    
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    
    return db_entry


@router.get("/treehole-entries", response_model=List[TreeholeEntryResponse])
async def get_published_treehole_entries(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取已发布的树洞条目"""
    entries = db.query(TreeholeEntry).filter(
        TreeholeEntry.is_published == True,
        TreeholeEntry.risk_level != "severe",
    ).order_by(TreeholeEntry.created_at.desc()).offset(skip).limit(limit).all()
    return [serialize_treehole_entry_for_public(entry) for entry in entries]


@router.delete("/treehole-entries/{entry_id}")
async def delete_treehole_entry(
    entry_id: int,
    db: Session = Depends(get_db)
):
    """删除树洞条目。当前 demo 模式不做用户归属校验。"""
    entry = db.query(TreeholeEntry).filter(TreeholeEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Treehole entry not found")

    db.delete(entry)
    db.commit()
    return {"message": "Treehole entry deleted"}


@router.get("/knowledge-contents", response_model=List[KnowledgeContentResponse])
async def get_knowledge_contents(
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取知识库内容"""
    query = db.query(KnowledgeContent)

    if category:
        query = query.filter(KnowledgeContent.category == category)

    if content_type:
        query = query.filter(KnowledgeContent.content_type == content_type)

    contents = query.offset(skip).limit(limit).all()
    return contents


@router.get("/public/knowledge-contents", response_model=List[KnowledgeContentResponse])
async def get_public_knowledge_contents(
    category: Optional[str] = None,
    content_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取前台发布的知识内容。"""
    query = db.query(KnowledgeContent).filter(KnowledgeContent.status == "published")

    if category:
        query = query.filter(KnowledgeContent.category == category)

    if content_type:
        query = query.filter(KnowledgeContent.content_type == content_type)

    return (
        query.order_by(KnowledgeContent.sort_order.asc(), KnowledgeContent.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/public/knowledge-topics", response_model=List[KnowledgeTopicResponse])
async def get_public_knowledge_topics(
    db: Session = Depends(get_db)
):
    """获取前台发布的专题列表。"""
    return (
        db.query(KnowledgeTopic)
        .filter(KnowledgeTopic.status == "published")
        .order_by(KnowledgeTopic.sort_order.asc(), KnowledgeTopic.id.desc())
        .all()
    )


@router.get("/public/daily-quote", response_model=DailyQuoteResponse)
async def get_public_daily_quote(
    db: Session = Depends(get_db)
):
    """获取当前发布的每日金句。"""
    quote = (
        db.query(DailyQuote)
        .filter(DailyQuote.status == "published")
        .order_by(DailyQuote.sort_order.asc(), DailyQuote.id.desc())
        .first()
    )
    if quote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="暂无已发布金句"
        )
    return quote


# ============ 后台管理员认证路由 ============

@router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(
    credentials: AdminLogin,
    db: Session = Depends(get_db)
):
    """管理员登录。"""
    ensure_default_admin_user(db)
    admin = db.query(AdminUser).filter(AdminUser.username == credentials.username).first()

    if not admin or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="管理员用户名或密码错误"
        )

    admin.last_login = datetime.utcnow()
    db.commit()
    db.refresh(admin)

    access_token = create_access_token(data={"sub": str(admin.id), "scope": "admin"})
    return AdminTokenResponse(
        access_token=access_token,
        user=AdminUserResponse.model_validate(admin),
    )


@router.get("/admin/me", response_model=AdminUserResponse)
async def get_admin_me(
    current_admin: AdminUser = Depends(get_current_admin_user_required)
):
    """获取当前管理员信息。"""
    return AdminUserResponse.model_validate(current_admin)


@router.get("/admin/daily-quotes", response_model=List[DailyQuoteResponse])
async def list_admin_daily_quotes(
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台获取每日金句列表。"""
    del current_admin
    return (
        db.query(DailyQuote)
        .order_by(DailyQuote.sort_order.asc(), DailyQuote.id.desc())
        .all()
    )


@router.post("/admin/daily-quotes", response_model=DailyQuoteResponse)
async def create_admin_daily_quote(
    quote: DailyQuoteCreate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台创建每日金句。"""
    del current_admin
    db_quote = DailyQuote(**quote.model_dump())
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    return db_quote


@router.put("/admin/daily-quotes/{quote_id}", response_model=DailyQuoteResponse)
async def update_admin_daily_quote(
    quote_id: int,
    quote: DailyQuoteUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台更新每日金句。"""
    del current_admin
    db_quote = db.query(DailyQuote).filter(DailyQuote.id == quote_id).first()
    if db_quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="金句不存在")

    for field, value in quote.model_dump().items():
        setattr(db_quote, field, value)

    db.commit()
    db.refresh(db_quote)
    return db_quote


@router.delete("/admin/daily-quotes/{quote_id}")
async def delete_admin_daily_quote(
    quote_id: int,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台删除每日金句。"""
    del current_admin
    db_quote = db.query(DailyQuote).filter(DailyQuote.id == quote_id).first()
    if db_quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="金句不存在")

    db.delete(db_quote)
    db.commit()
    return {"success": True}


@router.get("/admin/knowledge-contents", response_model=List[KnowledgeContentResponse])
async def list_admin_knowledge_contents(
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台获取知识内容列表。"""
    del current_admin
    return (
        db.query(KnowledgeContent)
        .order_by(KnowledgeContent.sort_order.asc(), KnowledgeContent.id.desc())
        .all()
    )


@router.post("/admin/knowledge-contents", response_model=KnowledgeContentResponse)
async def create_admin_knowledge_content(
    content: KnowledgeContentCreate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台创建知识内容。"""
    del current_admin
    db_content = KnowledgeContent(**content.model_dump())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


@router.put("/admin/knowledge-contents/{content_id}", response_model=KnowledgeContentResponse)
async def update_admin_knowledge_content(
    content_id: int,
    content: KnowledgeContentUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台更新知识内容。"""
    del current_admin
    db_content = db.query(KnowledgeContent).filter(KnowledgeContent.id == content_id).first()
    if db_content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="内容不存在")

    for field, value in content.model_dump().items():
        setattr(db_content, field, value)

    db.commit()
    db.refresh(db_content)
    return db_content


@router.delete("/admin/knowledge-contents/{content_id}")
async def delete_admin_knowledge_content(
    content_id: int,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台删除知识内容。"""
    del current_admin
    db_content = db.query(KnowledgeContent).filter(KnowledgeContent.id == content_id).first()
    if db_content is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="内容不存在")

    db.delete(db_content)
    db.commit()
    return {"success": True}


@router.get("/admin/knowledge-topics", response_model=List[KnowledgeTopicResponse])
async def list_admin_knowledge_topics(
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台获取专题列表。"""
    del current_admin
    return (
        db.query(KnowledgeTopic)
        .order_by(KnowledgeTopic.sort_order.asc(), KnowledgeTopic.id.desc())
        .all()
    )


@router.post("/admin/knowledge-topics", response_model=KnowledgeTopicResponse)
async def create_admin_knowledge_topic(
    topic: KnowledgeTopicCreate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台创建专题。"""
    del current_admin
    db_topic = KnowledgeTopic(**topic.model_dump())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic


@router.put("/admin/knowledge-topics/{topic_id}", response_model=KnowledgeTopicResponse)
async def update_admin_knowledge_topic(
    topic_id: int,
    topic: KnowledgeTopicUpdate,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台更新专题。"""
    del current_admin
    db_topic = db.query(KnowledgeTopic).filter(KnowledgeTopic.id == topic_id).first()
    if db_topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="专题不存在")

    for field, value in topic.model_dump().items():
        setattr(db_topic, field, value)

    db.commit()
    db.refresh(db_topic)
    return db_topic


@router.delete("/admin/knowledge-topics/{topic_id}")
async def delete_admin_knowledge_topic(
    topic_id: int,
    current_admin: AdminUser = Depends(get_current_admin_user_required),
    db: Session = Depends(get_db)
):
    """后台删除专题。"""
    del current_admin
    db_topic = db.query(KnowledgeTopic).filter(KnowledgeTopic.id == topic_id).first()
    if db_topic is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="专题不存在")

    db.delete(db_topic)
    db.commit()
    return {"success": True}


# ============ 用户认证路由 ============

def find_user_by_account(db: Session, account: str) -> Optional[User]:
    normalized = account.strip()
    if not normalized:
        return None

    user = db.query(User).filter(User.username == normalized).first()
    if user:
        return user

    return db.query(User).filter(User.email == normalized).first()


@router.post("/auth/register", response_model=TokenResponse)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """用户注册"""
    # 检查用户名是否已存在
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已被使用"
        )

    # 如果提供了邮箱，检查是否已存在
    email = user_data.email or f"{user_data.username}@local"
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # 创建用户
    db_user = User(
        username=user_data.username,
        email=email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 生成 token
    access_token = create_access_token(data={"sub": str(db_user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(db_user)
    )


@router.post("/auth/password-reset/request", response_model=PasswordResetRequestResponse)
async def request_password_reset(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Demo 密码找回：返回 6 位验证码。生产环境应改为邮件/短信发送。"""
    user = find_user_by_account(db, reset_request.account)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到该账号"
        )

    reset_code = f"{uuid.uuid4().int % 1_000_000:06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=PASSWORD_RESET_EXPIRES_MINUTES)
    PASSWORD_RESET_CODES[reset_request.account.strip().lower()] = {
        "user_id": user.id,
        "code": reset_code,
        "expires_at": expires_at,
    }

    return PasswordResetRequestResponse(
        account=user.username,
        delivery="demo",
        reset_code=reset_code,
        expires_in_minutes=PASSWORD_RESET_EXPIRES_MINUTES,
        message="演示环境已直接返回验证码；生产环境应通过邮件或短信发送。",
    )


@router.post("/auth/password-reset/confirm")
async def confirm_password_reset(
    reset_confirm: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """使用 demo 验证码重置密码。"""
    account_key = reset_confirm.account.strip().lower()
    reset_state = PASSWORD_RESET_CODES.get(account_key)
    if (
        reset_state is None
        or reset_state["code"] != reset_confirm.reset_code
        or reset_state["expires_at"] < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码无效或已过期"
        )

    user = db.query(User).filter(User.id == reset_state["user_id"]).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="未找到该账号"
        )

    user.password_hash = get_password_hash(reset_confirm.new_password)
    db.commit()
    PASSWORD_RESET_CODES.pop(account_key, None)
    return {"success": True, "message": "密码已重置"}


@router.post("/auth/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """用户登录"""
    # 查找用户
    user = db.query(User).filter(User.username == credentials.username).first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.commit()

    # 生成 token
    access_token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user_required)
):
    """获取当前用户信息"""
    return UserResponse.model_validate(current_user)


# ============ 游戏进度路由 ============

@router.post("/games/soap/round", response_model=SoapRoundResponse)
async def create_soap_round(round_request: SoapRoundRequest):
    """为肥皂游戏新一局选择颜色，优先避免和上一局重复。"""
    unlocked_skins = round_request.unlocked_skins or ["default"]
    candidates = [
        skin for skin in unlocked_skins
        if skin in SOAP_SKINS and skin != round_request.current_skin
    ]
    if not candidates:
        candidates = [skin for skin in unlocked_skins if skin in SOAP_SKINS] or ["default"]

    skin = candidates[0]
    skin_meta = SOAP_SKINS.get(skin, SOAP_SKINS["default"])
    return SoapRoundResponse(
        skin=skin,
        color=skin_meta["color"],
        label=skin_meta["label"],
    )


@router.get("/games/progress", response_model=List[GameProgressResponse])
async def get_all_game_progress(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """获取用户所有游戏进度"""
    progress_list = db.query(GameProgress).filter(
        GameProgress.user_id == current_user.id
    ).all()

    return [
        GameProgressResponse(
            id=p.id,
            game_type=p.game_type,
            total_play_count=p.total_play_count,
            total_play_time=p.total_play_time,
            unlocked_skins=json.loads(p.unlocked_skins),
            current_skin=p.current_skin,
            stats=json.loads(p.stats),
            updated_at=p.updated_at
        )
        for p in progress_list
    ]


@router.get("/games/progress/{game_type}", response_model=GameProgressResponse)
async def get_game_progress(
    game_type: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """获取单个游戏进度"""
    progress = db.query(GameProgress).filter(
        GameProgress.user_id == current_user.id,
        GameProgress.game_type == game_type
    ).first()

    if not progress:
        # 返回默认进度
        return GameProgressResponse(
            id=0,
            game_type=game_type,
            total_play_count=0,
            total_play_time=0,
            unlocked_skins=["default"],
            current_skin="default",
            stats={},
            updated_at=datetime.utcnow()
        )

    return GameProgressResponse(
        id=progress.id,
        game_type=progress.game_type,
        total_play_count=progress.total_play_count,
        total_play_time=progress.total_play_time,
        unlocked_skins=json.loads(progress.unlocked_skins),
        current_skin=progress.current_skin,
        stats=json.loads(progress.stats),
        updated_at=progress.updated_at
    )


@router.post("/games/progress/{game_type}", response_model=GameProgressResponse)
async def update_game_progress(
    game_type: str,
    update_data: GameProgressUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """更新游戏进度"""
    progress = db.query(GameProgress).filter(
        GameProgress.user_id == current_user.id,
        GameProgress.game_type == game_type
    ).first()

    if not progress:
        # 创建新进度
        progress = GameProgress(
            user_id=current_user.id,
            game_type=game_type,
            unlocked_skins="[]",
            stats="{}"
        )
        db.add(progress)

    # 更新数据
    if update_data.total_play_count is not None:
        progress.total_play_count = update_data.total_play_count
    if update_data.total_play_time is not None:
        progress.total_play_time = update_data.total_play_time
    if update_data.current_skin is not None:
        progress.current_skin = update_data.current_skin
    if update_data.unlocked_skins is not None:
        progress.unlocked_skins = json.dumps(update_data.unlocked_skins)
    if update_data.stats is not None:
        # 合并统计数据
        current_stats = json.loads(progress.stats)
        current_stats.update(update_data.stats)
        progress.stats = json.dumps(current_stats)

    progress.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(progress)

    return GameProgressResponse(
        id=progress.id,
        game_type=progress.game_type,
        total_play_count=progress.total_play_count,
        total_play_time=progress.total_play_time,
        unlocked_skins=json.loads(progress.unlocked_skins),
        current_skin=progress.current_skin,
        stats=json.loads(progress.stats),
        updated_at=progress.updated_at
    )


@router.post("/games/sync", response_model=List[GameProgressResponse])
async def sync_game_data(
    sync_data: GameSyncRequest,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """批量同步本地游戏数据到服务器"""
    results = []

    for item in sync_data.progress_list:
        game_type = item.get("game_type")
        if not game_type:
            continue

        progress = db.query(GameProgress).filter(
            GameProgress.user_id == current_user.id,
            GameProgress.game_type == game_type
        ).first()

        if not progress:
            progress = GameProgress(
                user_id=current_user.id,
                game_type=game_type,
                unlocked_skins="[]",
                stats="{}"
            )
            db.add(progress)

        # 合并数据（取较大值）
        progress.total_play_count = max(
            progress.total_play_count,
            item.get("total_play_count", 0)
        )
        progress.total_play_time = max(
            progress.total_play_time,
            item.get("total_play_time", 0)
        )

        # 合并解锁皮肤
        local_skins = set(item.get("unlocked_skins", ["default"]))
        server_skins = set(json.loads(progress.unlocked_skins))
        progress.unlocked_skins = json.dumps(list(local_skins | server_skins))

        # 合并统计数据
        local_stats = item.get("stats", {})
        server_stats = json.loads(progress.stats)
        for key, value in local_stats.items():
            if key in server_stats:
                if isinstance(value, (int, float)):
                    server_stats[key] = max(server_stats[key], value)
            else:
                server_stats[key] = value
        progress.stats = json.dumps(server_stats)

        progress.updated_at = datetime.utcnow()
        results.append(progress)

    db.commit()

    return [
        GameProgressResponse(
            id=p.id,
            game_type=p.game_type,
            total_play_count=p.total_play_count,
            total_play_time=p.total_play_time,
            unlocked_skins=json.loads(p.unlocked_skins),
            current_skin=p.current_skin,
            stats=json.loads(p.stats),
            updated_at=p.updated_at
        )
        for p in results
    ]


@router.post("/games/record")
async def record_game_session(
    record: GameRecordCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """记录一次游戏会话"""
    progress = db.query(GameProgress).filter(
        GameProgress.user_id == current_user.id,
        GameProgress.game_type == record.game_type
    ).first()

    if not progress:
        progress = GameProgress(
            user_id=current_user.id,
            game_type=record.game_type,
            unlocked_skins="[]",
            stats="{}"
        )
        db.add(progress)

    # 更新统计数据
    progress.total_play_count += 1
    progress.total_play_time += record.play_time

    if record.stats:
        current_stats = json.loads(progress.stats)
        for key, value in record.stats.items():
            if key in current_stats:
                if isinstance(value, (int, float)):
                    current_stats[key] = current_stats.get(key, 0) + value
            else:
                current_stats[key] = value
        progress.stats = json.dumps(current_stats)

    progress.updated_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": "游戏记录已保存"}
