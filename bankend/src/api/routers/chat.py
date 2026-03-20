#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/19.
"""
from infra.llm.chat_openai import ChatOpenAI
from app.agent import ChatBIAgent
from app.schema import Event
from fastapi.responses import StreamingResponse
from fastapi import APIRouter
import json 

from config import AGENT_MODEL
from api.dependencies import get_session_manager
from api.dependencies import get_tool_register

router = APIRouter()

@router.get("/api/chatbi/chat")
async def chat_stream(session_id: str, message: str):
    """
    发送消息，返回SSE 流式响应
    事件类型： text(文本片段), tool(工具调用结果), error(错误信息)
    """

    async def event_generator(sid: str, message: str):
        try:
            tool_register = await get_tool_register()
            sm = get_session_manager()
            llm_client = ChatOpenAI(model=AGENT_MODEL)
            agent = ChatBIAgent(
                llm_client=llm_client,
                session_manager=sm,
                tool_register=tool_register,
                session_id=sid,
                user_prompt=message
            )
            async for event in agent.stream_run():
                # 将字典转换为JSON字符串，并按SSE格式包装
                event_json = json.dumps(event.model_dump(), ensure_ascii=False)
                yield f"data: {event_json}\n\n"
        except Exception as e:
            error_event = Event(type="error", content=str(e)).model_dump()
            error_json = json.dumps(error_event, ensure_ascii=False)
            yield f"data: {error_json}\n\n"

    return StreamingResponse(
        content=event_generator(session_id, message),
        media_type="text/event-stream", 
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

