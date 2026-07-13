#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
四川方言智能对话系统 - 主入口

启动方式:
    python main.py
    或
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import uvicorn
from app import app
from app.core.config import settings


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )