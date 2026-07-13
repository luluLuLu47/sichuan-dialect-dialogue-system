# app/api/health.py
# 健康检查API路由

from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.core.config import settings
from app.core.database import DatabaseManager

router = APIRouter(tags=["系统"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="健康检查",
    description="检查服务运行状态和数据库连接"
)
async def health_check() -> HealthResponse:
    """
    健康检查接口
    
    返回服务状态、版本号、数据库连接状态等信息
    """
    # 检查Neo4j连接
    neo4j_connected = False
    try:
        await DatabaseManager.get_driver()
        neo4j_connected = True
    except:
        pass
    
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        neo4j_connected=neo4j_connected,
        llm_provider=settings.llm_provider
    )


@router.get(
    "/",
    summary="根路径",
    description="返回服务基本信息"
)
async def root():
    """根路径"""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }