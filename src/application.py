#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/06.
Description: 
"""

import chainlit as cl 

import os
import sys
import time

from tomli import load
import asyncio

print(os.getcwd())

from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from app.tool_register import ToolRegister
from infra.llm.chat_openai import ChatOpenAI
from app.agent import ChatBIAgent

cl.instrument_openai()

@cl.on_message 
async def on_message(message: cl.Message):
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')
    
    user_prompt = message.content
    
    
    print(message.content)
    loading = cl.Message(content='thinking')
    await loading.send()
    
    
    # counter = cl.user_session.get("counter")
    # counter += 1
    # cl.user_session.set("counter", counter)
    
    # print(f"session_id: {counter}")
    
    session_id = cl.user_session.get("id") or "default"
    
    print(session_id)

    agent = ChatBIAgent(llm_client, tool_register, session_id, user_prompt)
    content = agent.run()
    # content = "你好呀"
    # time.sleep(50)
    # print(f"content: {content}")
    
    loading.content = content
    await loading.update()
