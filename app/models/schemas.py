# app/models/schemas.py
# API数据模型定义

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


# ==================== 请求模型 ====================

class ChatRequest(BaseModel):
    """对话请求"""
    message: str = Field(..., description="用户消息", min_length=1, max_length=1000)
    session_id: Optional[str] = Field(None, description="会话ID")
    context: Optional[Dict[str, Any]] = Field(None, description="上下文信息")
    
    class Config:
        json_schema_extra = {
            "example": {
                "message": "成都哪里的火锅好吃？",
                "session_id": "session_123",
                "context": None
            }
        }


# ==================== 响应模型 ====================

class ChatResponse(BaseModel):
    """对话响应"""
    response: str = Field(..., description="回复内容")
    session_id: Optional[str] = Field(None, description="会话ID")
    intent: Optional[str] = Field(None, description="识别的意图")
    scene: Optional[str] = Field(None, description="匹配的场景")
    entities: List[str] = Field(default_factory=list, description="识别的实体")
    confidence: float = Field(0.0, description="置信度")
    timestamp: datetime = Field(default_factory=datetime.now, description="时间戳")
    
    class Config:
        json_schema_extra = {
            "example": {
                "response": "切吃那个火锅嘛，巴适得板！",
                "session_id": "session_123",
                "intent": "美食查询",
                "scene": "美食推荐",
                "entities": ["火锅"],
                "confidence": 0.85,
                "timestamp": "2026-07-13T17:36:00"
            }
        }


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    version: str = Field(..., description="版本号")
    neo4j_connected: bool = Field(..., description="Neo4j连接状态")
    llm_provider: str = Field(..., description="LLM提供商")
    timestamp: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "neo4j_connected": True,
                "llm_provider": "deepseek",
                "timestamp": "2026-07-13T17:36:00"
            }
        }


class ErrorResponse(BaseModel):
    """错误响应"""
    error: str = Field(..., description="错误信息")
    detail: Optional[str] = Field(None, description="详细错误")
    timestamp: datetime = Field(default_factory=datetime.now)


# ==================== 内部数据模型 ====================

class PipelineResultData(BaseModel):
    """流水线处理结果（内部使用）"""
    original_input: str
    normalized_input: str
    intent: Optional[str] = None
    scene: Optional[str] = None
    entities: List[str] = Field(default_factory=list)
    kg_results: List[Dict] = Field(default_factory=list)
    response_template: Optional[str] = None
    final_response: str
    confidence: float = 0.0
    metadata: Dict[str, Any] = Field(default_factory=dict)