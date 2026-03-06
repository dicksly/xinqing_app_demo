"""
情绪服务 - 处理情绪相关逻辑
"""

from typing import List, Dict
from ..models.models import EmotionRecord
import json


class EmotionService:
    """情绪服务类"""
    
    def get_top_stress_sources(self, records: List[EmotionRecord]) -> List[str]:
        """
        获取最常出现的压力源
        
        Args:
            records: 情绪记录列表
            
        Returns:
            top_sources: 压力源列表，按出现频率排序
        """
        source_count = {}
        
        for record in records:
            if record.stress_sources:
                try:
                    sources = json.loads(record.stress_sources)
                    if isinstance(sources, list):
                        for source in sources:
                            source_count[source] = source_count.get(source, 0) + 1
                except:
                    pass
        
        # 按频率排序
        sorted_sources = sorted(source_count.items(), key=lambda x: x[1], reverse=True)
        return [source[0] for source in sorted_sources[:5]]  # 返回前5个
    
    def get_mood_trend(self, records: List[EmotionRecord]) -> List[Dict]:
        """
        获取心情趋势
        
        Args:
            records: 情绪记录列表
            
        Returns:
            trend: 趋势数据，包含日期和对应的心情
        """
        trend = []
        
        for record in sorted(records, key=lambda x: x.created_at):
            trend.append({
                "date": record.created_at.strftime("%Y-%m-%d"),
                "mood": record.mood,
                "energy_level": record.energy_level,
                "sleep_quality": record.sleep_quality
            })
        
        return trend
    
    def calculate_energy_average(self, records: List[EmotionRecord]) -> float:
        """计算平均能量水平"""
        if not records:
            return 0.0
        
        total = sum(record.energy_level or 0 for record in records)
        return total / len(records)
    
    def calculate_sleep_average(self, records: List[EmotionRecord]) -> float:
        """计算平均睡眠质量"""
        if not records:
            return 0.0
        
        total = sum(record.sleep_quality or 0 for record in records)
        return total / len(records)
