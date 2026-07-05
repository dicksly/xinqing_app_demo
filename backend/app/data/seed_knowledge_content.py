from datetime import date, datetime

from sqlalchemy.orm import Session

from ..models.models import DailyQuote, KnowledgeContent, KnowledgeTopic


DEFAULT_QUOTES = [
    {
        "text": "生命中最重要的不是你遭遇了什么，而是你记住了什么。",
        "author": "未知",
        "locale": "zh-CN",
        "status": "published",
        "sort_order": 1,
        "effective_date": date(2026, 3, 16),
    }
]

DEFAULT_CONTENTS = [
    {
        "title": "如何拒绝精神内耗",
        "summary": "从识别反刍开始，减少不必要的自我消耗。",
        "content": "精神内耗是现代人常见的心理困扰，可以从觉察和行动两端入手。",
        "content_type": "article",
        "category": "情绪管理",
        "cover_url": "",
        "external_url": "",
        "status": "published",
        "sort_order": 1,
        "locale": "zh-CN",
        "published_at": datetime(2026, 3, 16, 9, 0, 0),
        "tags": '["情绪管理","认知"]',
    },
]

DEFAULT_TOPICS = [
    {
        "title": "考试季抗压指南",
        "description": "帮助考生调整心态，发挥最佳水平",
        "status": "published",
        "content_count": 12,
        "locale": "zh-CN",
        "sort_order": 1,
    },
    {
        "title": "毕业季迷茫破解",
        "description": "从校园到职场的心理过渡指南",
        "status": "published",
        "content_count": 8,
        "locale": "zh-CN",
        "sort_order": 2,
    },
]


def _seed_if_empty(db: Session, model, rows: list[dict]) -> None:
    if db.query(model).count() > 0:
        return

    for row in rows:
        db.add(model(**row))


def seed_knowledge_content(db: Session) -> None:
    """在相关表为空时写入默认充电站内容。"""
    _seed_if_empty(db, DailyQuote, DEFAULT_QUOTES)
    _seed_if_empty(db, KnowledgeContent, DEFAULT_CONTENTS)
    _seed_if_empty(db, KnowledgeTopic, DEFAULT_TOPICS)
    db.commit()
