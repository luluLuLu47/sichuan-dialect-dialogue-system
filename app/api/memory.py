from fastapi import APIRouter, Query
from typing import List, Optional
from app.services.memory_service import get_memory_service

router = APIRouter(prefix="/api/v1/memory", tags=["记忆管理"])


@router.get("/sessions", summary="获取所有会话列表")
async def get_all_sessions():
    service = get_memory_service()
    sessions = await service.get_all_sessions()
    return {"status": "success", "data": sessions}


@router.get("/session/{session_id}", summary="获取会话详情")
async def get_session_detail(session_id: str):
    service = get_memory_service()
    short_term = await service.get_short_term_memory(session_id)
    long_term = await service.get_long_term_memory(session_id)
    summary = await service.get_session_summary(session_id)

    return {
        "status": "success",
        "data": {
            "session_id": session_id,
            "summary": summary,
            "short_term_memory": short_term,
            "long_term_memory": long_term
        }
    }


@router.post("/session/{session_id}/summary", summary="更新会话摘要")
async def update_session_summary(
    session_id: str,
    summary: str = Query(..., description="会话摘要"),
    messages_count: int = Query(0, description="消息数量"),
    topic: str = Query("", description="话题")
):
    service = get_memory_service()
    await service.update_session_summary(session_id, summary, messages_count)
    return {"status": "success", "message": "会话摘要已更新"}


@router.post("/session/{session_id}/memory", summary="添加记忆")
async def add_memory(
    session_id: str,
    content: str = Query(..., description="记忆内容"),
    memory_type: str = Query("short_term", description="记忆类型: short_term/long_term"),
    summary: str = Query("", description="摘要")
):
    service = get_memory_service()
    await service.add_memory(session_id, content, memory_type, summary)
    return {"status": "success", "message": "记忆已添加"}


@router.delete("/session/{session_id}", summary="清空会话记忆")
async def clear_session_memory(session_id: str):
    service = get_memory_service()
    await service.clear_memory(session_id)
    return {"status": "success", "message": "会话记忆已清空"}