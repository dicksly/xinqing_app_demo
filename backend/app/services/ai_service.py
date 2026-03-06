"""
AI 服务 - 提供风险检测和情感响应生成
"""

import json
from typing import List, Dict, Optional
from ..models.models import EmotionRecord


class AIService:
    """AI 服务类"""
    
    # 敏感词库（P0级关键功能）
    HIGH_RISK_KEYWORDS = [
        "自杀", "结束生命", "不想活了", "活着没意思",
        "死", "结束自己", "自我了断"
    ]
    
    MEDIUM_RISK_KEYWORDS = [
        "伤害自己", "自残", "痛苦", "绝望", "无望",
        "崩溃", "想哭", "难过"
    ]
    
    def detect_risk_level(self, content: str) -> str:
        """
        检测内容的风险等级
        
        Args:
            content: 用户输入的内容
            
        Returns:
            risk_level: 风险等级 - safe/mild/severe
        """
        if not content:
            return "safe"
        
        content_lower = content.lower()
        
        # 检测高风险关键词
        for keyword in self.HIGH_RISK_KEYWORDS:
            if keyword in content:
                return "severe"
        
        # 检测中等风险关键词
        for keyword in self.MEDIUM_RISK_KEYWORDS:
            if keyword in content:
                return "mild"
        
        return "safe"
    
    def generate_response(self, content: str, risk_level: str) -> str:
        """
        根据内容和风险等级生成 AI 响应
        
        Args:
            content: 用户输入的内容
            risk_level: 风险等级
            
        Returns:
            response: AI 生成的响应
        """
        if risk_level == "severe":
            return self._generate_severe_response()
        elif risk_level == "mild":
            return self._generate_mild_response(content)
        else:
            return self._generate_normal_response(content)
    
    def _generate_severe_response(self) -> str:
        """生成高风险响应"""
        return """我感受到了你现在的痛苦，这真的很难受。但请记住，你并不孤单。

如果你有危险的想法，请立即寻求帮助：
- 全国24小时心理援助热线：400-161-9995
- 生命热线：021-62798990

请给自己一个机会，和专业的心理咨询师聊聊，或者联系你信任的人。你的生命很重要。"""
    
    def _generate_mild_response(self, content: str) -> str:
        """生成中等风险响应"""
        return """我听到了你的声音，感受到了你的不容易。能够把这些情绪说出来，本身就很勇敢了。

这样的感受是暂时的，就像乌云终会散去。建议你：
1. 深呼吸几次，让自己先平静下来
2. 去"正念与放松实验室"试试冥想练习
3. 如果觉得持续困扰，可以考虑找专业的心理咨询师聊聊

记住，寻求帮助是强者的表现，不是软弱。"""
    
    def _generate_normal_response(self, content: str) -> str:
        """生成正常响应"""
        return """谢谢你愿意和我分享，我会认真倾听的。

每个人都有情绪低落的时候，这很正常。把这里当作树洞吧，说出你的感受，我会一直在这里陪伴你。

如果需要，你也可以试试我们的"正念与放松实验室"或"每日情绪气象站"来帮助自己调节心情。"""
