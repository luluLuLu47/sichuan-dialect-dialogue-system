# app/api/__init__.py
from .chat import router as chat_router
from .health import router as health_router
from .knowledge import router as knowledge_router

__all__ = ["chat_router", "health_router", "knowledge_router"]