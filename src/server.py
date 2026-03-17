#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI 服务入口，替代 Chainlit 作为后端 API 服务。
"""

import os
import sys

# 确保 src/ 在 sys.path 中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import chat, session

app = FastAPI(
    title="ChatBI Agent API",
    description="ChatBI Agent 的后端 API，提供聊天 SSE 流式接口和会话管理",
    version="1.0.0",
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router, tags=["chat"])
app.include_router(session.router, tags=["sessions"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}
