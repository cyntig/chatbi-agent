#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/18.
"""
from typing import Optional
import jsonlines
from datetime import datetime

import os
import threading

PROJECT_ROOT: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) 
DEFAULT_STATE_FILE: str = os.path.join(PROJECT_ROOT, "stats", "session_stats.jsonl")


class SessionInfo:
    """会话摘要信息"""
    def __init__(self, session_id: str, title: str, updated_at: str, message_count: int):
        self.session_id: str = session_id
        self.title: str = title
        self.updated_at: str = updated_at
        self.message_count: int = message_count
    
    def to_dict(self) -> dict:
        return {
            "session_id": self.session_id,
            "title": self.title,
            "updated_at": self.updated_at,
            "message_count": self.message_count,
        }

class SessionManager:
    def __init__(self, state_file: str = DEFAULT_STATE_FILE):
        self._file = state_file
        self._lock = threading.Lock()
        self._states = self._load()

    
    def _load(self) -> dict: 
        """从 jsonl 文件中加载会话状态"""
        states = {}
        if os.path.exists(self._file):
            with jsonlines.open(self._file) as reader:
                for line in reader:
                    sid: str = line.get("session_id", "unknown")
                    if sid not in states:
                        states[sid] = []
                    states[sid].append({
                        "session_id": sid,
                        "update_time": line.get("update_time", ""),
                        "messages": line.get("messages", []),
                        "title": line.get("title", ""),
                    })
        return states

    
    def _save(self):
        """将会话状态保存到 jsonl 文件"""
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
        """"从消息列表中提取标题（第一条user消息，截断到30字符）"""
        for msg in messages:
            if msg["role"] == "user":
                content = msg.get("content", "") + ("..." if len(msg["content"]) > 30 else "")
                return msg["content"][:30]
        return "新对话"

    
    # =================================== 供Agent调用的接口 =================================
    def get_messages(self, session_id: str) -> list:
        """获取指定会话的消息列表"""
        with self._lock:
            if session_id in self._states:
                latest = self._states[session_id][-1]
                return latest["messages"]
            return []
    
    def save_state(self, session_id: str, messages: list):
        """保存会话状态"""
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

    
    # =================================== 供API使用的CRUD接口 =================================
    def list_sessions(self) -> list[SessionInfo]:
        """"获取所有会话列表"""
        with self._lock:
            sessions = []
            for session_id, states in self._states.items():
                latest = states[-1]
                sessions.append(SessionInfo(
                    session_id=session_id,
                    title=latest.get("title", ""),
                    updated_at=latest["update_time"],
                    message_count=len(latest["messages"])
                ))
            return sessions
    

    def get_session(self, session_id: str) -> Optional[dict]:
        """获取指定会话的详细信息(含完整消息历史，过滤掉system消息)"""
        with self._lock:
            if session_id not in self._states:
                return None
            latest_state = self._states[session_id][-1]
            # 过滤掉 system prompt，不返回给前端展示
            visible_messages = [
                msg for msg in latest_state["messages"]
                if msg.get("role") != "system"
            ]
            return {
                "session_id": session_id,
                "title": latest_state.get("title", ""),
                "updated_at": latest_state["update_time"],
                "messages": visible_messages
            }

    def create_session(self, session_id: str, title: str) -> dict:
        """创建新会话"""
        with self._lock:
            state = {
                "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
                "messages": [],
                "title": title
            }
            if session_id not in self._states:
                self._states[session_id] = []
            self._states[session_id].append(state)
            self._save()
            return {
                "session_id": session_id,
                "title": title,
                "updated_at": state['update_time'],
                "message_count": 0
            }

    def update_title(self, session_id: str, new_title: str) -> bool:
        """更新会话标题"""
        with self._lock:
            if session_id not in self._states:
                return False
            for state in self._states[session_id]:
                state["title"] = new_title
            self._save()
            return True

    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        with self._lock:
            if session_id not in self._states:
                return False
            del self._states[session_id]
            self._save()
            return True


