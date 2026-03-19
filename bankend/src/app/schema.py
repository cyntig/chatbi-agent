#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/11.
"""

from typing import Literal
from pydantic import BaseModel 


class ToolCallEvent(BaseModel):
    name: str 
    arguments: str 
    output: str 
    content: str | None = None
    
class Event(BaseModel):
    type : Literal["text", "tool", "error"]
    content: str | None = None
    tool_call: ToolCallEvent | None = None
