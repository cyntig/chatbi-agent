#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
会话 CRUD 端点
"""

import uuid
from fastapi import APIRouter, HTTPException

from api.schemas import (
    SessionCreate,
    SessionUpdate,
    SessionInfoResponse,
    SessionDetailResponse,
)
from api.dependencies import get_session_manager

router = APIRouter()


@router.get("/api/sessions", response_model=list[SessionInfoResponse])
async def list_sessions():
    """获取所有会话列表"""
    sm = get_session_manager()
    sessions = sm.list_sessions()
    return [s.to_dict() for s in sessions]


@router.get("/api/sessions/{session_id}", response_model=SessionDetailResponse)
async def get_session(session_id: str):
    """获取会话详情（含完整消息历史）"""
    sm = get_session_manager()
    detail = sm.get_session(session_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return detail


@router.post("/api/sessions", response_model=SessionInfoResponse)
async def create_session(body: SessionCreate):
    """创建新会话"""
    sm = get_session_manager()
    session_id = str(uuid.uuid4())
    result = sm.create_session(session_id, body.title)
    return result


@router.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    """删除会话"""
    sm = get_session_manager()
    success = sm.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session deleted"}


@router.patch("/api/sessions/{session_id}")
async def update_session(session_id: str, body: SessionUpdate):
    """更新会话（重命名）"""
    sm = get_session_manager()
    if body.title is not None:
        success = sm.update_title(session_id, body.title)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
    return {"message": "Session updated"}
