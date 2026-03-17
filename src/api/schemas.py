#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Pydantic 请求/响应模型
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ChatRequest(BaseModel):
    session_id: str
    message: str
    model: str = "moonshotai/Kimi-K2-Instruct-0905"


class SessionCreate(BaseModel):
    title: str = "新对话"


class SessionUpdate(BaseModel):
    title: Optional[str] = None


class SessionInfoResponse(BaseModel):
    session_id: str
    title: str
    updated_at: str
    message_count: int


class SessionDetailResponse(BaseModel):
    session_id: str
    title: str
    updated_at: str
    messages: list[dict]
