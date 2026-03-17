#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
共享依赖：SessionManager 单例、ToolRegister 工厂
"""

from app.session_manager import SessionManager

# 全局 SessionManager 单例
_session_manager: SessionManager | None = None


def get_session_manager() -> SessionManager:
    global _session_manager
    if _session_manager is None:
        _session_manager = SessionManager()
    return _session_manager
