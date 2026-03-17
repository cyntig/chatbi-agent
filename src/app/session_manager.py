#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SessionManager: 从 ChatBIAgent 提取的会话持久化管理。
支持会话的 CRUD 操作，使用线程锁保证并发安全。
"""

import os
import threading
from datetime import datetime
from typing import Optional

import jsonlines

# 项目根目录（chatbi-agent/）
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_STATE_FILE = os.path.join(PROJECT_ROOT, "stats", "session_stats.jsonl")


class SessionInfo:
    """会话摘要信息"""
    def __init__(self, session_id: str, title: str, updated_at: str, message_count: int):
        self.session_id = session_id
        self.title = title
        self.updated_at = updated_at
        self.message_count = message_count

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "title": self.title,
            "updated_at": self.updated_at,
            "message_count": self.message_count,
        }


class SessionManager:
    """
    会话状态管理器。
    管理所有会话的消息历史，持久化到 jsonl 文件。
    """

    def __init__(self, state_file: str = DEFAULT_STATE_FILE):
        self._file = state_file
        self._lock = threading.Lock()
        self._states = self._load()

    def _load(self) -> dict:
        """从 jsonl 文件加载所有会话状态"""
        states = {}
        if os.path.exists(self._file):
            with jsonlines.open(self._file) as reader:
                for line in reader:
                    sid = line.get("session_id", "unknown")
                    if sid not in states:
                        states[sid] = []
                    states[sid].append({
                        "update_time": line.get("update_time", ""),
                        "messages": line.get("messages", []),
                        "title": line.get("title", ""),
                    })
        return states

    def _save(self):
        """将所有会话状态写回 jsonl 文件"""
        os.makedirs(os.path.dirname(self._file), exist_ok=True)
        with jsonlines.open(self._file, mode='w') as writer:
            for session_id, session_states in self._states.items():
                for state in session_states:
                    record = {
                        "session_id": session_id,
                        "update_time": state["update_time"],
                        "messages": state["messages"],
                        "title": state.get("title", ""),
                    }
                    writer.write(record)

    def _extract_title(self, messages: list) -> str:
        """从消息列表中提取标题（第一条 user 消息，截断到30字符）"""
        for msg in messages:
            if msg.get("role") == "user":
                content = msg.get("content", "")
                return content[:30] + ("..." if len(content) > 30 else "")
        return "新对话"

    # ========== 供 Agent 使用的方法 ==========

    def get_messages(self, session_id: str) -> list:
        """获取某个会话的最新消息列表，供 Agent 初始化使用"""
        with self._lock:
            if session_id in self._states and self._states[session_id]:
                latest = self._states[session_id][-1]
                return latest["messages"].copy()
            return []

    def save_state(self, session_id: str, messages: list):
        """保存 Agent 运行后的会话状态"""
        with self._lock:
            title = self._extract_title(messages)
            state = {
                "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
                "messages": messages,
                "title": title,
            }
            if session_id not in self._states:
                self._states[session_id] = []
            self._states[session_id].append(state)
            self._save()

    # ========== 供 API 使用的 CRUD 方法 ==========

    def list_sessions(self) -> list[SessionInfo]:
        """列出所有会话的摘要信息"""
        with self._lock:
            result = []
            for sid, states in self._states.items():
                if not states:
                    continue
                latest = states[-1]
                messages = latest.get("messages", [])
                title = latest.get("title") or self._extract_title(messages)
                result.append(SessionInfo(
                    session_id=sid,
                    title=title,
                    updated_at=latest.get("update_time", ""),
                    message_count=len(messages),
                ))
            # 按更新时间降序
            result.sort(key=lambda s: s.updated_at, reverse=True)
            return result

    def get_session(self, session_id: str) -> Optional[dict]:
        """获取会话详情（含完整消息历史）"""
        with self._lock:
            if session_id not in self._states or not self._states[session_id]:
                return None
            latest = self._states[session_id][-1]
            messages = latest.get("messages", [])
            title = latest.get("title") or self._extract_title(messages)
            return {
                "session_id": session_id,
                "title": title,
                "updated_at": latest.get("update_time", ""),
                "messages": messages,
            }

    def create_session(self, session_id: str, title: str = "新对话") -> dict:
        """创建空会话"""
        with self._lock:
            state = {
                "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
                "messages": [],
                "title": title,
            }
            if session_id not in self._states:
                self._states[session_id] = []
            self._states[session_id].append(state)
            self._save()
            return {
                "session_id": session_id,
                "title": title,
                "updated_at": state["update_time"],
                "message_count": 0,
            }

    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        with self._lock:
            if session_id in self._states:
                del self._states[session_id]
                self._save()
                return True
            return False

    def update_title(self, session_id: str, title: str) -> bool:
        """更新会话标题"""
        with self._lock:
            if session_id in self._states and self._states[session_id]:
                self._states[session_id][-1]["title"] = title
                self._save()
                return True
            return False
