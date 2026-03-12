#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/11.
"""

from typing import Literal


class ToolCallEvent:
    def __init__(
        self,
        name: str,
        arguments: str,
        output: str,
        content: str | None = None
    ) -> None:
        self.name = name
        self.arguments = arguments
        self.output = output
        self.content = content


class Event:
    def __init__(
        self,
        type: Literal["content", "tool"],
        content: str | None = None,
        tool_call: ToolCallEvent | None = None,
    ) -> None:

        self.type = type
        self.tool_call = tool_call
        self.content = content
