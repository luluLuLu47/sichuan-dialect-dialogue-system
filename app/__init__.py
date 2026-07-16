# app/__init__.py
# 应用初始化

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from loguru import logger
import sys

from app.core.config import settings
from app.core.database import DatabaseManager
from app.api import chat_router, health_router, knowledge_router, memory_router


# 配置日志
logger.remove()
logger.add(
    sys.stderr,
    level=settings.log_level,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    应用生命周期管理
    
    启动时：连接数据库
    关闭时：断开数据库连接
    """
    # 启动
    logger.info(f"启动 {settings.app_name} v{settings.app_version}")
    logger.info(f"环境: {settings.environment}")
    logger.info(f"LLM提供商: {settings.llm_provider}")
    
    # 连接数据库
    try:
        await DatabaseManager.connect()
        logger.info("Neo4j数据库连接成功")
    except Exception as e:
        logger.warning(f"Neo4j数据库连接失败: {e}")
        logger.warning("将以降级模式运行")
    
    yield
    
    # 关闭
    await DatabaseManager.close()
    logger.info("应用关闭")


def create_app() -> FastAPI:
    """创建FastAPI应用实例"""
    
    app = FastAPI(
        title=settings.app_name,
        description="""
## 四川方言智能对话系统

基于知识图谱的大语言模型方言对话系统。

### 功能特性
- 方言风格对话
- 美食推荐
- 旅游攻略
- 方言学习

### 技术架构
- FastAPI异步框架
- Neo4j知识图谱
- DeepSeek/OpenAI/Ollama LLM
        """,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )
    
    # CORS中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    app.include_router(health_router)
    app.include_router(chat_router)
    app.include_router(knowledge_router)
    app.include_router(memory_router)
    
    return app


# 创建应用实例
app = create_app()