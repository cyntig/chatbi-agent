#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/18.
"""
from app.session_manager import SessionManager
from app.tool_register import ToolRegister
from app.mcp_clients.chart_client import ChartClient
from app.mcp_clients.chatbi_client import ChatBIClient

_session_manager: SessionManager | None = None
_tool_register: ToolRegister | None = None


def get_session_manager() -> SessionManager:
    global _session_manager 
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager


async def get_tool_register() -> ToolRegister:
    global _tool_register
    if _tool_register is None:
        _tool_register = ToolRegister(ChatBIClient(), ChartClient())
        await _tool_register.initialize()
    return _tool_register