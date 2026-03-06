"""
API v1 路由
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..core.database import get_db
from ..models.models import EmotionRecord, MindfulnessSession, TreeholeEntry, KnowledgeContent
from ..schemas.schemas import (
    EmotionRecordCreate, EmotionRecordResponse,
    MindfulnessSessionCreate, MindfulnessSessionResponse,
    TreeholeEntryCreate, TreeholeEntryResponse,
    KnowledgeContentResponse, WeeklyReportResponse
)
from ..services.emotion_service import EmotionService
from ..services.ai_service import AIService
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
