# app/api/chat.py
# 对话API路由

from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from app.models.schemas import ChatRequest, ChatResponse, ErrorResponse
from app.services.pipeline_service import get_pipeline_service, PipelineService

router = APIRouter(prefix="/api/v1", tags=["对话"])


def get_pipeline() -> PipelineService:
    """获取流水线服务依赖"""
    return get_pipeline_service()


@router.post(
    "/chat",
    response_model=ChatResponse,
    responses={
        200: {"description": "成功响应"},
        400: {"model": ErrorResponse, "description": "请求参数错误"},
        500: {"model": ErrorResponse, "description": "服务器内部错误"}
    },
    summary="对话接口",
    description="处理用户输入，返回四川方言风格的回复"
)
async def chat(
    request: ChatRequest,
    pipeline: PipelineService = Depends(get_pipeline)
) -> ChatResponse:
    """
    对话接口
    
    - **message**: 用户消息
    - **session_id**: 可选的会话ID
    - **context**: 可选的上下文信息
    """
    try:
        # 调用流水线处理
        result = await pipeline.process(request.message)
        
        return ChatResponse(
            response=result.final_response,
            session_id=request.session_id,
            intent=result.intent,
            scene=result.scene,
            entities=result.entities or [],
            confidence=result.confidence,
        )
        
    except Exception as e:
        logger.error(f"对话处理异常: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"服务器处理异常: {str(e)}"
        )


@router.post(
    "/chat/stream",
    summary="流式对话接口",
    description="流式返回对话响应（暂不实现）"
)
async def chat_stream(request: ChatRequest):
    """流式对话接口（待实现）"""
    from fastapi.responses import StreamingResponse
    
    # TODO: 实现流式响应
    raise HTTPException(
        status_code=501,
        detail="流式接口暂未实现"
    )