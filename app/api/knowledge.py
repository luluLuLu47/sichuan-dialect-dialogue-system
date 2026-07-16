# app/api/knowledge.py
# 知识图谱查询API路由

from fastapi import APIRouter, Query
from typing import List, Optional
from app.core.database import DatabaseManager, KG_QUERIES
from app.services.search_service import get_search_service
from loguru import logger

router = APIRouter(prefix="/api/v1/knowledge", tags=["知识图谱"])


# ==================== 方言词查询 ====================

@router.get("/dialect-words", summary="查询方言词汇")
async def get_dialect_words(
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None, description="搜索关键词")
):
    """
    查询方言词汇列表
    
    - 支持关键词搜索
    - 返回词汇、释义、词性
    """
    try:
        if search:
            query = """
                MATCH (dw:DialectWord)
                WHERE dw.word CONTAINS $search OR dw.standard_form CONTAINS $search
                OPTIONAL MATCH (dw)-[:HAS_MEANING]->(m:Meaning)
                RETURN dw.word as word, dw.standard_form as standard_form,
                       dw.pronunciation as pronunciation, dw.example as example,
                       collect(DISTINCT m.content) as meanings
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"search": search, "limit": limit})
        else:
            query = """
                MATCH (dw:DialectWord)
                OPTIONAL MATCH (dw)-[:HAS_MEANING]->(m:Meaning)
                RETURN dw.word as word, dw.standard_form as standard_form,
                       dw.pronunciation as pronunciation, dw.example as example,
                       collect(DISTINCT m.content) as meanings
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"limit": limit})
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询方言词汇失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 场景对话查询 ====================

@router.get("/scenes", summary="查询对话场景")
async def get_scenes():
    """
    查询所有对话场景
    
    - 场景ID、名称、类型
    - 模板数量
    """
    try:
        query = """
            MATCH (ds:DialogScene)
            OPTIONAL MATCH (ds)-[:HAS_TEMPLATE]->(t:ReplyTemplate)
            OPTIONAL MATCH (u:Utterance)-[:BELONGS_TO_SCENE]->(ds)
            RETURN ds.scene_id as id, ds.scene_name as name, 
                   ds.scene_type as type, ds.description as description,
                   count(DISTINCT t) as template_count,
                   count(DISTINCT u) as utterance_count
            ORDER BY ds.scene_id
        """
        results = await DatabaseManager.execute_query(query)
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询场景失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 美食查询 ====================

@router.get("/foods", summary="查询四川美食")
async def get_foods(
    region: Optional[str] = Query(default=None, description="地区筛选"),
    limit: int = Query(default=50, ge=1, le=200)
):
    """
    查询四川美食
    
    - 支持按地区筛选
    - 返回名称、类型、方言别名、推荐语
    """
    try:
        if region:
            query = """
                MATCH (f:Food)-[:BELONGS_REGION]->(l:Location)
                WHERE l.name CONTAINS $region
                RETURN f.name as name, f.type as type, 
                       f.dialect_alias as dialect_alias,
                       f.local_recommend_phrase as phrase,
                       l.name as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"region": region, "limit": limit})
        else:
            query = """
                MATCH (f:Food)
                OPTIONAL MATCH (f)-[:BELONGS_REGION]->(l:Location)
                RETURN f.name as name, f.type as type, 
                       f.dialect_alias as dialect_alias,
                       f.local_recommend_phrase as phrase,
                       l.name as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"limit": limit})
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询美食失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 景点查询 ====================

@router.get("/attractions", summary="查询四川景点")
async def get_attractions(
    region: Optional[str] = Query(default=None, description="地区筛选"),
    limit: int = Query(default=50, ge=1, le=200)
):
    """
    查询四川旅游景点
    
    - 支持按地区筛选
    - 返回名称、类型、方言描述、地区
    """
    try:
        if region:
            query = """
                MATCH (a:Attraction)-[:BELONGS_REGION]->(l:Location)
                WHERE l.name CONTAINS $region
                RETURN a.name as name, a.type as type, 
                       a.dialect_alias as dialect_alias,
                       a.local_description as description,
                       l.name as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"region": region, "limit": limit})
        else:
            query = """
                MATCH (a:Attraction)
                OPTIONAL MATCH (a)-[:BELONGS_REGION]->(l:Location)
                RETURN a.name as name, a.type as type, 
                       a.dialect_alias as dialect_alias,
                       a.local_description as description,
                       l.name as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"limit": limit})
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询景点失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 民俗查询 ====================

@router.get("/customs", summary="查询四川民俗")
async def get_customs():
    """
    查询四川民俗文化
    
    - 民俗名称、类型、方言描述
    """
    try:
        query = """
            MATCH (c:Custom)
            RETURN c.custom_id as id, c.name as name, 
                   c.type as type, c.dialect_description as description,
                   c.local_phrases as phrases
            ORDER BY c.custom_id
        """
        results = await DatabaseManager.execute_query(query)
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询民俗失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 意图查询 ====================

@router.get("/intents", summary="查询用户意图")
async def get_intents():
    """
    查询系统支持的意图类型
    
    - 意图ID、名称、类型
    - 关联关键词
    """
    try:
        query = """
            MATCH (ui:UserIntent)
            OPTIONAL MATCH (ui)-[:HAS_KEYWORD]->(kf:KeywordFeature)
            RETURN ui.intent_id as id, ui.intent_name as name, 
                   ui.intent_type as type, ui.description as description,
                   collect(DISTINCT kf.keyword) as keywords
            ORDER BY ui.intent_id
        """
        results = await DatabaseManager.execute_query(query)
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询意图失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 地区查询 ====================

@router.get("/regions", summary="查询四川地区")
async def get_regions():
    """
    查询四川行政区划
    
    - 地区名称、代码
    """
    try:
        query = """
            MATCH (l:Location)
            RETURN l.location_id as id, l.name as name
            ORDER BY l.location_id
        """
        results = await DatabaseManager.execute_query(query)
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询地区失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 方言表达模板查询 ====================

@router.get("/expressions", summary="查询方言表达模板")
async def get_expressions(
    scene_type: Optional[str] = Query(default=None, description="场景类型筛选"),
    limit: int = Query(default=50, ge=1, le=200)
):
    """
    查询方言表达模板
    
    - 模板内容、方言词、场景类型
    """
    try:
        if scene_type:
            query = """
                MATCH (de:DialectExpression)
                WHERE de.scene_type CONTAINS $scene_type
                RETURN de.template as template, de.dialect_words as dialect_words,
                       de.scene_type as scene_type, de.region as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"scene_type": scene_type, "limit": limit})
        else:
            query = """
                MATCH (de:DialectExpression)
                RETURN de.template as template, de.dialect_words as dialect_words,
                       de.scene_type as scene_type, de.region as region
                LIMIT $limit
            """
            results = await DatabaseManager.execute_query(query, {"limit": limit})
        
        return {"status": "success", "data": results, "count": len(results)}
        
    except Exception as e:
        logger.error(f"查询表达模板失败: {e}")
        return {"status": "error", "message": str(e), "data": []}


# ==================== 实体搜索（联网+知识图谱） ====================

@router.get("/search", summary="实体搜索")
async def search_entity(
    query: str = Query(..., description="搜索关键词"),
    entity_type: Optional[str] = Query(None, description="实体类型: food/attraction/custom/dialect")
):
    try:
        search_service = get_search_service()
        result = await search_service.get_entity_info(query)

        if result["status"] == "success":
            return {"status": "success", "data": result["data"]}

        kg_result = None
        if entity_type == "food" or entity_type is None:
            query_cypher = """
                MATCH (f:Food)
                WHERE f.name CONTAINS $query OR f.dialect_alias CONTAINS $query
                RETURN f.name as name, f.type as type, 
                       f.dialect_alias as dialect_alias,
                       f.local_recommend_phrase as phrase
                LIMIT 1
            """
            kg_result = await DatabaseManager.execute_query(query_cypher, {"query": query})

        if not kg_result or entity_type == "attraction":
            query_cypher = """
                MATCH (a:Attraction)
                WHERE a.name CONTAINS $query
                RETURN a.name as name, a.type as type,
                       a.local_description as description
                LIMIT 1
            """
            kg_result = await DatabaseManager.execute_query(query_cypher, {"query": query})

        if kg_result:
            return {"status": "success", "data": kg_result[0]}

        return {"status": "not_found", "data": {"title": query, "summary": f"未找到'{query}'的详细信息"}}

    except Exception as e:
        logger.error(f"实体搜索失败: {e}")
        return {"status": "error", "message": str(e), "data": None}


# ==================== 美食详情 ====================

@router.get("/food/{food_name}", summary="获取美食详情")
async def get_food_detail(food_name: str):
    try:
        search_service = get_search_service()

        query = """
            MATCH (f:Food)
            WHERE f.name = $name OR f.dialect_alias CONTAINS $name
            OPTIONAL MATCH (f)-[:BELONGS_REGION]->(l:Location)
            RETURN f.name as name, f.type as type,
                   f.dialect_alias as dialect_alias,
                   f.local_recommend_phrase as phrase,
                   l.name as region
            LIMIT 1
        """
        results = await DatabaseManager.execute_query(query, {"name": food_name})

        if results:
            food_info = results[0]
            search_result = await search_service.get_entity_info(food_name)
            if search_result["status"] == "success":
                food_info["summary"] = search_result["data"]["summary"]
                food_info["image"] = search_result["data"]["image"]
            return {"status": "success", "data": food_info}

        search_result = await search_service.get_entity_info(food_name)
        if search_result["status"] == "success":
            return {"status": "success", "data": search_result["data"]}

        return {"status": "not_found", "data": None}

    except Exception as e:
        logger.error(f"获取美食详情失败: {e}")
        return {"status": "error", "message": str(e), "data": None}


# ==================== 景点详情 ====================

@router.get("/attraction/{attraction_name}", summary="获取景点详情")
async def get_attraction_detail(attraction_name: str):
    try:
        search_service = get_search_service()

        query = """
            MATCH (a:Attraction)
            WHERE a.name = $name
            OPTIONAL MATCH (a)-[:BELONGS_REGION]->(l:Location)
            RETURN a.name as name, a.type as type,
                   a.local_description as description,
                   l.name as region
            LIMIT 1
        """
        results = await DatabaseManager.execute_query(query, {"name": attraction_name})

        if results:
            attr_info = results[0]
            search_result = await search_service.get_entity_info(attraction_name)
            if search_result["status"] == "success":
                attr_info["summary"] = search_result["data"]["summary"]
                attr_info["image"] = search_result["data"]["image"]
            return {"status": "success", "data": attr_info}

        search_result = await search_service.get_entity_info(attraction_name)
        if search_result["status"] == "success":
            return {"status": "success", "data": search_result["data"]}

        return {"status": "not_found", "data": None}

    except Exception as e:
        logger.error(f"获取景点详情失败: {e}")
        return {"status": "error", "message": str(e), "data": None}