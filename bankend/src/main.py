#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ChatBI FastAPI Server
为前端提供 REST API 和 SSE 流式接口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routers import chat, session
import uvicorn

# 创建 FastAPI 应用
app = FastAPI(
    title="ChatBI API",
    description="智能数据分析助手 API",
    version="1.0.0"
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router, tags=["chat"])
app.include_router(session.router, tags=["session"])

# 根路径
@app.get("/")
async def root():
    return {
        "message": "ChatBI API Server",
        "version": "1.0.0",
        "status": "running"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    print("🚀 Starting ChatBI API Server...")
    print("📍 API 地址: http://localhost:8000")
    print("📚 API 文档: http://localhost:8000/docs")
    print("🔧 健康检查: http://localhost:8000/health")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
