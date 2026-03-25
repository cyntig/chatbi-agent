#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created by cyntig on 2026/03/06.
Description: 
"""

import chainlit as cl 

from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from app.tool_register import ToolRegister
from infra.llm.chat_openai import ChatOpenAI
from app.agent import ChatBIAgent

cl.instrument_openai()

@cl.on_message 
async def on_message(message: cl.Message):
    ## 非stream
    # await normal_run(message)
    
    ## stream
    await stream_run(message) 

async def normal_run(user_message: cl.Message):
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    
    llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')
    user_prompt = user_message.content
    session_id = cl.user_session.get("id") or "default"
    agent = ChatBIAgent(llm_client, tool_register, session_id, user_prompt)
    content = await agent.async_run()
    await cl.Message(content=content).send()

async def stream_run(user_message: cl.Message):
    assistant_msg = cl.Message(content='')
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')
    user_prompt = user_message.content 
    session_id = cl.user_session.get("id") or "default"
    agent = ChatBIAgent(llm_client, tool_register, session_id, user_prompt)
    async for event in agent.stream_run():
        if event.type == 'content':
            await assistant_msg.stream_token(event.content) 
            await assistant_msg.update()
        elif event.type == 'tool':
            tool_call = event.tool_call
            async with cl.Step(name=f"{tool_call.name}") as step:
                step.input = tool_call.arguments
                step.output = tool_call.output
                
                
    
    