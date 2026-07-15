# app/services/pipeline_service.py
# 7层流水线处理服务 - 核心对话处理逻辑

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from loguru import logger
from app.core.database import DatabaseManager, KG_QUERIES
from app.services.llm_service import get_llm_service


@dataclass
class PipelineResult:
    """流水线处理结果"""
    original_input: str                    # 原始输入
    normalized_input: str = ""             # 标准化输入
    intent: Optional[str] = None           # 识别的意图
    scene: Optional[str] = None            # 识别的场景
    entities: List[str] = None             # 识别的实体
    kg_results: List[Dict] = None          # 知识图谱查询结果
    response_template: Optional[str] = None # 响应模板
    final_response: str = ""               # 最终回复
    confidence: float = 0.0                # 置信度
    metadata: Dict[str, Any] = None        # 元数据


class PipelineService:
    """
    7层流水线处理服务
    
    处理流程：
    1. 输入标准化 -> 文本清洗、方言词归一化
    2. 意图识别 -> 基于关键词和规则
    3. 场景匹配 -> 匹配最合适的对话场景
    4. 实体抽取 -> 提取美食、景点、民俗等实体
    5. 知识检索 -> 从Neo4j查询相关数据
    6. 模板匹配 -> 匹配方言表达模板
    7. 响应生成 -> 使用LLM生成最终回复
    """
    
    def __init__(self):
        self.llm_service = get_llm_service()
        self.db = DatabaseManager
    
    async def process(self, user_input: str) -> PipelineResult:
        """
        处理用户输入
        
        Args:
            user_input: 用户输入文本
            
        Returns:
            PipelineResult: 处理结果
        """
        result = PipelineResult(original_input=user_input)
        
        try:
            # Layer 1: 输入标准化
            result.normalized_input = await self._normalize_input(user_input)
            logger.debug(f"[Layer 1] 标准化: {result.normalized_input}")
            
            # Layer 2: 意图识别
            result.intent = await self._detect_intent(result.normalized_input)
            logger.debug(f"[Layer 2] 意图: {result.intent}")
            
            # Layer 3: 场景匹配
            result.scene = await self._match_scene(result.normalized_input, result.intent)
            logger.debug(f"[Layer 3] 场景: {result.scene}")
            
            # Layer 4: 实体抽取
            result.entities = await self._extract_entities(result.normalized_input)
            logger.debug(f"[Layer 4] 实体: {result.entities}")
            
            # Layer 5: 知识检索
            result.kg_results = await self._retrieve_knowledge(result.entities, result.intent)
            logger.debug(f"[Layer 5] KG结果: {len(result.kg_results) if result.kg_results else 0}条")
            
            # Layer 6: 模板匹配
            result.response_template = await self._match_template(result.scene, result.entities)
            logger.debug(f"[Layer 6] 模板: {result.response_template}")
            
            # Layer 7: 响应生成
            result.final_response = await self._generate_response(
                result.normalized_input,
                result.intent,
                result.scene,
                result.entities,
                result.kg_results,
                result.response_template
            )
            logger.debug(f"[Layer 7] 回复: {result.final_response}")
            
            result.confidence = 0.85  # 简单置信度
            result.metadata = {"pipeline_version": "1.0"}
            
        except Exception as e:
            logger.error(f"流水线处理异常: {e}")
            result.final_response = "不好意思，我遇到点问题，再说一遍嘛！"
            result.confidence = 0.0
        
        return result
    
    # ==================== Layer 1: 输入标准化 ====================
    
    async def _normalize_input(self, text: str) -> str:
        """
        标准化输入文本
        
        - 去除多余空格
        - 统一标点符号
        - 方言词归一化
        """
        import re
        
        # 去除多余空格
        text = re.sub(r'\s+', ' ', text).strip()
        
        # 统一标点
        text = re.sub(r'[，。！？、；：]', lambda m: m.group(0), text)
        
        # 方言词归一化映射
        dialect_mapping = {
            "撒": "撒",
            "撒子": "啥子",
            "杂个": "咋个",
            "啷个": "咋个",
        }
        
        for old, new in dialect_mapping.items():
            text = text.replace(old, new)
        
        return text
    
    # ==================== Layer 2: 意图识别 ====================
    
    async def _detect_intent(self, text: str) -> str:
        """
        识别用户意图
        
        基于关键词匹配和规则
        """
        # 意图关键词映射
        intent_keywords = {
            "美食查询": ["吃", "火锅", "串串", "好吃", "美食", "味道", "巴适"],
            "旅游推荐": ["去", "耍", "景点", "好看", "风景", "玩"],
            "方言学习": ["啥子", "咋个", "意思", "怎么说", "方言"],
            "闲聊": ["天气", "最近", "怎么样", "好不好"],
            "问路": ["咋个走", "怎么走", "在哪儿", "在哪里"],
            "价格询问": ["好多钱", "多少钱", "相因", "便宜"]
        }
        
        # 统计各意图的匹配关键词数
        intent_scores = {}
        for intent, keywords in intent_keywords.items():
            score = sum(1 for kw in keywords if kw in text)
            if score > 0:
                intent_scores[intent] = score
        
        if intent_scores:
            return max(intent_scores, key=intent_scores.get)
        
        # 尝试从知识图谱查询
        try:
            result = await self.db.execute_query(
                KG_QUERIES["find_intent_by_keywords"],
                {"text": text}
            )
            if result:
                return result[0].get("intent_name", "闲聊")
        except:
            pass
        
        return "闲聊"
    
    # ==================== Layer 3: 场景匹配 ====================
    
    async def _match_scene(self, text: str, intent: str) -> str:
        """
        匹配对话场景
        
        Args:
            text: 输入文本
            intent: 已识别的意图
            
        Returns:
            场景名称
        """
        # 意图-场景映射
        intent_scene_map = {
            "美食查询": "美食推荐",
            "旅游推荐": "旅游攻略",
            "方言学习": "方言教学",
            "闲聊": "闲聊",
            "问路": "问路交通",
            "价格询问": "价格购物"
        }
        
        # 直接映射
        if intent in intent_scene_map:
            return intent_scene_map[intent]
        
        # 从知识图谱查询场景
        try:
            results = await self.db.execute_query(
                KG_QUERIES["find_scene_by_keyword"],
                {"keyword": text[:10]}
            )
            if results:
                return results[0].get("scene_name", "闲聊")
        except:
            pass
        
        return "闲聊"
    
    # ==================== Layer 4: 实体抽取 ====================
    
    async def _extract_entities(self, text: str) -> List[str]:
        """
        抽取实体
        
        提取美食、景点、民俗等实体
        """
        entities = []
        
        # 常见实体词（可从KG加载）
        entity_patterns = {
            "美食": ["火锅", "串串", "担担面", "抄手", "水饺", "麻婆豆腐", 
                    "夫妻肺片", "回锅肉", "钵钵鸡", "冒菜", "肥肠粉"],
            "景点": ["宽窄巷子", "锦里", "武侯祠", "杜甫草堂", "熊猫基地",
                    "都江堰", "青城山", "乐山大佛", "峨眉山", "九寨沟"],
            "民俗": ["摆龙门阵", "坐茶铺", "九大碗", "坝坝宴", "走人户"]
        }
        
        for entity_type, patterns in entity_patterns.items():
            for pattern in patterns:
                if pattern in text:
                    entities.append(pattern)
        
        # 去重
        return list(set(entities))
    
    # ==================== Layer 5: 知识检索 ====================
    
    async def _retrieve_knowledge(
        self, 
        entities: List[str], 
        intent: str
    ) -> List[Dict]:
        """
        从知识图谱检索相关知识
        """
        results = []
        
        try:
            for entity in entities:
                # 美食查询
                if intent == "美食查询":
                    foods = await self.db.execute_query(
                        KG_QUERIES["find_food_by_name"],
                        {"name": entity}
                    )
                    results.extend(foods)
                
                # 景点查询
                elif intent == "旅游推荐":
                    attractions = await self.db.execute_query(
                        KG_QUERIES["find_attraction_by_name"],
                        {"name": entity}
                    )
                    results.extend(attractions)
                
                # 推荐话术
                recs = await self.db.execute_query(
                    KG_QUERIES["find_recommendation_by_entity"],
                    {"entity_name": entity}
                )
                results.extend(recs)
        
        except Exception as e:
            logger.error(f"知识检索异常: {e}")
        
        return results
    
    # ==================== Layer 6: 模板匹配 ====================
    
    async def _match_template(
        self, 
        scene: str, 
        entities: List[str]
    ) -> Optional[str]:
        """
        匹配方言表达模板
        """
        # 预定义模板
        templates = {
            "美食推荐": [
                "切吃那个{entity}嘛，巴适得板！",
                "这个{entity}好吃得很！",
                "{entity}味道正宗！"
            ],
            "旅游攻略": [
                "{entity}值得去耍！",
                "{entity}风景好看！",
                "切{entity}看看嘛！"
            ],
            "方言教学": [
                "{entity}是方言词，意思就是...",
                "你晓得{entity}是啥子意思嘛？"
            ],
            "闲聊": [
                "安逸！",
                "巴适！",
                "要得嘛！"
            ]
        }
        
        # 获取场景模板
        scene_templates = templates.get(scene, templates["闲聊"])
        
        # 如果有实体，替换模板
        if entities and scene in templates:
            import random
            template = random.choice(scene_templates)
            entity = entities[0] if entities else ""
            return template.format(entity=entity)
        
        return scene_templates[0] if scene_templates else None
    
    # ==================== Layer 7: 响应生成 ====================
    
    async def _generate_response(
        self,
        normalized_input: str,
        intent: str,
        scene: str,
        entities: List[str],
        kg_results: List[Dict],
        template: Optional[str]
    ) -> str:
        """
        生成最终响应
        """
        # 如果有模板且有实体，直接返回
        if template and entities:
            return template
        
        # 构建上下文
        context = {
            "intent": intent,
            "scene": scene,
            "entities": entities,
            "kg_info": kg_results[:3] if kg_results else []
        }
        
        # 调用LLM生成回复
        try:
            response = await self.llm_service.generate_dialect_response(
                normalized_input,
                context
            )
            return response
        except Exception as e:
            logger.error(f"LLM生成失败: {e}")
            # 降级响应
            if template:
                return template
            return "你说啥子？我晓得不多，再说说看！"


# 单例
_pipeline_service: Optional[PipelineService] = None


def get_pipeline_service() -> PipelineService:
    """获取流水线服务实例"""
    global _pipeline_service
    if _pipeline_service is None:
        _pipeline_service = PipelineService()
    return _pipeline_service