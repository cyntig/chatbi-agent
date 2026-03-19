#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/19.
"""

import uuid

from fastapi import APIRouter, HTTPException
from api.schemas import (
    SessionInfoResponse,
    SessionDetialResponse
)
from api.dependencies import get_session_manager
from app.session_manager import SessionManager

router = APIRouter()


@router.get("/api/chatbi/sessions", response_model=list[SessionInfoResponse])
async def list_sessions():
    """获取所有会话列表"""
    sm: SessionManager = get_session_manager()
    sessions = sm.list_sessions()  
    return [s.to_dict() for s in sessions]

@router.get("/api/chatbi/sessions/{session_id}", response_model=SessionDetialResponse)
async def get_session(session_id: str):
    """获取对话详情（含完整消息历史）"""
    sm: SessionManager = get_session_manager()
    return sm.get_session(session_id)

@router.post("/api/chatbi/sessions", response_model=SessionInfoResponse)
async def create_session(title: str="新对话"):
    """创建新会话"""
    sid = str(uuid.uuid4())
    sm: SessionManager = get_session_manager()
    return sm.create_session(sid, title)

@router.patch("/api/chatbi/sessions/{session_id}")
async def update_session(session_id: str, new_title: str) -> dict:
    """更新会话标题"""
    sm: SessionManager = get_session_manager()
    success = sm.update_title(session_id, new_title)
    if not success:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"message": "更新成功"}

@router.delete("/api/chatbi/sessions/{session_id}") 
async def delete_session(session_id: str) -> dict:
    """删除会话"""
    sm: SessionManager = get_session_manager()
    success = sm.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="会话不存在")
    return {"message": "删除成功"}
