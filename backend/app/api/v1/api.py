"""
API v1 路由
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import uuid

from ...core.database import get_db
from ...core.config import settings
from ...models.models import EmotionRecord, MindfulnessSession, TreeholeEntry, KnowledgeContent, User, GameProgress
from ...schemas.schemas import (
    EmotionRecordCreate, EmotionRecordResponse,
    MindfulnessSessionCreate, MindfulnessSessionResponse,
    TreeholeEntryCreate, TreeholeEntryResponse,
    KnowledgeContentResponse, WeeklyReportResponse,
    UserCreate, UserLogin, UserResponse, TokenResponse,
    GameProgressUpdate, GameProgressResponse, GameSyncRequest, GameRecordCreate
)
from ...services.emotion_service import EmotionService
from ...services.ai_service import AIService
from ...services.auth_service import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_user_required
)
from datetime import datetime, timedelta

router = APIRouter()

# 初始化服务
emotion_service = EmotionService()
ai_service = AIService()


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


@router.post("/treehole-entries", response_model=TreeholeEntryResponse)
async def create_treehole_entry(
    entry: TreeholeEntryCreate,
    db: Session = Depends(get_db)
):
    """创建树洞条目"""
    db_entry = TreeholeEntry(**entry.dict())
    
    # 风险检测
    risk_level = ai_service.detect_risk_level(db_entry.content or "")
    db_entry.risk_level = risk_level
    
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
        TreeholeEntry.is_published == True
    ).offset(skip).limit(limit).all()
    return entries


@router.get("/knowledge-contents", response_model=List[KnowledgeContentResponse])
async def get_knowledge_contents(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """获取知识库内容"""
    query = db.query(KnowledgeContent)

    if category:
        query = query.filter(KnowledgeContent.category == category)

    contents = query.offset(skip).limit(limit).all()
    return contents


# ============ 用户认证路由 ============

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

    # 检查邮箱是否已存在
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # 创建用户
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # 生成 token
    access_token = create_access_token(data={"sub": str(db_user.id)})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(db_user)
    )


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
        user=UserResponse.from_orm(user)
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user_required)
):
    """获取当前用户信息"""
    return UserResponse.from_orm(current_user)


# ============ 游戏进度路由 ============

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
