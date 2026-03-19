#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/19.
"""
from typing import Optional

from pydantic import BaseModel

class SessionInfoResponse(BaseModel):
    session_id: str
    title: str 
    updated_at: str 
    message_count: int 

class SessionDetialResponse(BaseModel):
    session_id: str
    title: str
    updated_at: str
    messages: list[dict]
