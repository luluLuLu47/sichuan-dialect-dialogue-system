# app/core/database.py
# Neo4j数据库连接管理

from typing import Optional
from neo4j import AsyncGraphDatabase, AsyncDriver
from neo4j.exceptions import ServiceUnavailable, AuthError
from loguru import logger
from .config import settings


class DatabaseManager:
    """Neo4j数据库管理器"""

    _driver: Optional[AsyncDriver] = None

    @classmethod
    async def get_driver(cls) -> AsyncDriver:
        """获取数据库驱动实例"""
        if cls._driver is None:
            await cls.connect()
        return cls._driver

    @classmethod
    async def connect(cls) -> None:
        """连接数据库"""
        try:
            # 使用元组格式的认证（用户名，密码）
            cls._driver = AsyncGraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_user, settings.neo4j_password)
            )
            
            # 验证连接
            async with cls._driver.session() as session:
                await session.run("RETURN 1")
            
            logger.info(
                f"Neo4j数据库连接成功: {settings.neo4j_uri}/{settings.neo4j_database}"
            )
            
        except AuthError as e:
            logger.error(f"Neo4j认证失败: {e}")
            raise
        except ServiceUnavailable as e:
            logger.error(f"Neo4j服务不可用: {e}")
            raise
        except Exception as e:
            logger.error(f"Neo4j连接异常: {e}")
            raise
    
    @classmethod
    async def close(cls) -> None:
        """关闭数据库连接"""
        if cls._driver:
            await cls._driver.close()
            cls._driver = None
            logger.info("Neo4j数据库连接已关闭")
    
    @classmethod
    async def execute_query(
        cls, 
        query: str, 
        parameters: dict = None
    ) -> list:
        """
        执行Cypher查询
        
        Args:
            query: Cypher查询语句
            parameters: 查询参数
            
        Returns:
            查询结果列表
        """
        driver = await cls.get_driver()
        
        async with driver.session(database=settings.neo4j_database) as session:
            result = await session.run(query, parameters or {})
            records = await result.data()
            return records
    
    @classmethod
    async def execute_write(
        cls, 
        query: str, 
        parameters: dict = None
    ) -> list:
        """
        执行写入操作
        
        Args:
            query: Cypher写入语句
            parameters: 查询参数
            
        Returns:
            操作结果
        """
        driver = await cls.get_driver()
        
        async with driver.session(database=settings.neo4j_database) as session:
            result = await session.run(query, parameters or {})
            records = await result.data()
            return records


# 便捷函数
async def get_db_driver() -> AsyncDriver:
    """获取数据库驱动"""
    return await DatabaseManager.get_driver()


async def close_db_driver() -> None:
    """关闭数据库连接"""
    await DatabaseManager.close()


async def query_neo4j(query: str, params: dict = None) -> list:
    """
    执行Neo4j查询的便捷函数
    
    Args:
        query: Cypher查询语句
        params: 查询参数
        
    Returns:
        查询结果
    """
    return await DatabaseManager.execute_query(query, params)


# ==================== 知识图谱查询模板 ====================

KG_QUERIES = {
    # 方言词查询
    "find_dialect_word": """
        MATCH (dw:DialectWord {word: $word})
        OPTIONAL MATCH (dw)-[:HAS_POS]->(pos:PartOfSpeech)
        OPTIONAL MATCH (dw)-[:HAS_MEANING]->(m:Meaning)
        RETURN dw.word as word, dw.meanings as meanings, 
               collect(DISTINCT pos.name) as parts_of_speech
    """,
    
    # 场景查询
    "find_scene_by_keyword": """
        MATCH (ds:DialogScene)
        WHERE ds.scene_name CONTAINS $keyword 
           OR ds.scene_type CONTAINS $keyword
        RETURN ds.scene_id as scene_id, ds.scene_name as scene_name,
               ds.template as template
    """,
    
    # 美食推荐
    "find_food_by_name": """
        MATCH (f:Food)
        WHERE f.name CONTAINS $name OR f.dialect_alias CONTAINS $name
        OPTIONAL MATCH (f)-[:BELONGS_REGION]->(l:Location)
        RETURN f.name as name, f.type as type, f.local_recommend_phrase as phrase,
               l.name as region
        LIMIT 10
    """,
    
    # 景点推荐
    "find_attraction_by_name": """
        MATCH (a:Attraction)
        WHERE a.name CONTAINS $name OR a.dialect_alias CONTAINS $name
        OPTIONAL MATCH (a)-[:BELONGS_REGION]->(l:Location)
        RETURN a.name as name, a.type as type, a.local_description as desc,
               l.name as region
        LIMIT 10
    """,
    
    # 意图识别
    "find_intent_by_keywords": """
        MATCH (ui:UserIntent)-[:HAS_KEYWORD]->(kf:KeywordFeature)
        WHERE $text CONTAINS kf.keyword
        WITH ui, count(kf) as keyword_count
        ORDER BY keyword_count DESC
        LIMIT 1
        RETURN ui.intent_id as intent_id, ui.intent_name as intent_name,
               ui.intent_type as intent_type
    """,
    
    # 方言表达模板
    "find_expression_by_scene": """
        MATCH (de:DialectExpression)-[:SCENE_MATCH]->(ds:DialogScene)
        WHERE ds.scene_id = $scene_id OR ds.scene_name = $scene_name
        RETURN de.template as template, de.dialect_words as dialect_words
        LIMIT 5
    """,
    
    # 推荐话术
    "find_recommendation_by_entity": """
        MATCH (rc:Recommendation)-[:RECOMMEND_FOR]->(entity)
        WHERE entity.name CONTAINS $entity_name
        RETURN rc.phrase as phrase, labels(entity)[0] as entity_type
        LIMIT 3
    """
}