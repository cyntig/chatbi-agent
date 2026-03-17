#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
聊天 SSE 流式端点
"""

import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from api.schemas import ChatRequest
from api.dependencies import get_session_manager
from app.agent import ChatBIAgent
from app.tool_register import ToolRegister
from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from infra.llm.chat_openai import ChatOpenAI

router = APIRouter()


@router.post("/api/chat")
async def chat_stream(request: ChatRequest):
    """
    发送消息，返回 SSE 流式响应。
    事件类型：content (文本片段), tool_end (工具调用结果), done (完成), error (错误)
    """

    async def event_generator():
        try:
            tool_register = ToolRegister(ChartClient(), ChatBIClient())
            await tool_register.async_load_tools()
            llm_client = ChatOpenAI(request.model)
            session_manager = get_session_manager()

            agent = ChatBIAgent(
                llmClient=llm_client,
                tool_register=tool_register,
                session_id=request.session_id,
                user_prompt=request.message,
                session_manager=session_manager,
            )

            async for event in agent.stream_run():
                if event.type == 'content':
                    data = json.dumps({"text": event.content}, ensure_ascii=False)
                    yield f"event: content\ndata: {data}\n\n"
                elif event.type == 'tool':
                    tc = event.tool_call
                    data = json.dumps({
                        "name": tc.name,
                        "arguments": tc.arguments,
                        "output": tc.output,
                        "content": tc.content,
                    }, ensure_ascii=False, default=str)
                    yield f"event: tool_end\ndata: {data}\n\n"

            done_data = json.dumps({"session_id": request.session_id}, ensure_ascii=False)
            yield f"event: done\ndata: {done_data}\n\n"

        except Exception as e:
            error_data = json.dumps({"message": str(e)}, ensure_ascii=False)
            yield f"event: error\ndata: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )
