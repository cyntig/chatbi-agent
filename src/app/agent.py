import asyncio
from datetime import datetime
import json
import os
import sys
from typing import Literal, Optional

from app.tool_register import ToolRegister
from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from app.session_manager import SessionManager, DEFAULT_STATE_FILE
from infra.llm.chat_openai import ChatOpenAI
from infra.logger import Logger
from infra.Utils import parser_to_json
from app.schema import Event, ToolCallEvent

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# 项目根目录
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class ChatBIAgent:
    def __init__(self,
                 llmClient: ChatOpenAI,
                 tool_register: ToolRegister,
                 session_id: str,
                 user_prompt: str,
                 max_round: int = -1,
                 session_manager: Optional[SessionManager] = None):
        self._user_prompt = user_prompt
        self._sys_prompt = self._load_sys_prompt()
        self._session_manager = session_manager or SessionManager()
        self._tool_register = tool_register
        self._llmClient = llmClient
        self._session_id = session_id
        self._max_round = max_round
        self._init_message()
        self.log = Logger()

    def _load_sys_prompt(self):
        prompt_path = os.path.join(PROJECT_ROOT, "prompts", "system_prompt.md")
        with open(prompt_path, "r", encoding="utf-8") as f:
            content = f.read()
        return content

    def _init_message(self):
        existing_messages = self._session_manager.get_messages(self._session_id)
        if existing_messages:
            self._messages = existing_messages
        else:
            self._messages = [{'role': 'system', 'content': self._sys_prompt}]

        self._messages.append({'role': 'user', 'content': self._user_prompt})

    def _save_session(self):
        """将当前会话状态委托给 SessionManager 保存"""
        self._session_manager.save_state(self._session_id, self._messages)

    async def async_run(self):
        round = 0
        tools = self._tool_register.list_tools()

        response_content = ""

        while self._max_round == -1 or round < self._max_round:
            round += 1
            message = await self._llmClient.async_chat(
                self._messages,
                temperature=0.3,
                tools=tools,
                tool_choice='auto'
            )
            self.log.normal_log.info(f"Round {round}")
            if message.tool_calls:
                self._messages.append(message.model_dump())
                for tool_call in message.tool_calls:
                    print(f"call tool: {tool_call}")
                    tool_call_name = tool_call.function.name
                    tool_call_args_str = tool_call.function.arguments
                    mcp_client = self._tool_register.get_client(tool_call_name)
                    tool_call_result = await mcp_client.call_tool(
                        tool_call_name, json.loads(tool_call_args_str))
                    tool_call_result_context = "\n".join(
                        [context.text for context in mcp_client.get_result_contents(tool_call_result)])

                    self._messages.append({
                        'role': 'tool',
                        'tool_call_id': tool_call.id,
                        "name": tool_call_name,
                        'content': tool_call_result_context
                    })
            else:
                self._messages.append({
                    'role': 'assistant',
                    'content': message.content
                })
                response_content = message.content
                break

        self._save_session()

        return response_content

    async def stream_run(self):
        round = 0
        tools = self._tool_register.list_tools()

        while self._max_round == -1 or round < self._max_round:
            round += 1
            deltas = self._llmClient.asyn_stream_chat(
                self._messages,
                temperature=0.3,
                tools=tools,
                tool_choice='auto',
                max_tokens=96000
            )
            self.log.normal_log.info(f"Round {round}")

            content = ""
            idx_to_tool_call = {}
            async for delta in deltas:
                if delta.tool_calls:  # tool_call
                    for delta_tool_call in delta.tool_calls:
                        index = delta_tool_call.index
                        if index not in idx_to_tool_call:
                            idx_to_tool_call[index] = {
                                "index": index,
                                "id": delta_tool_call.id,
                                "type": "function",
                                "function": {
                                    "name": "",
                                    "arguments": ""
                                }
                            }
                        if delta_tool_call.function.name:
                            idx_to_tool_call[index]['function']['name'] += delta_tool_call.function.name
                        idx_to_tool_call[index]['function']['arguments'] += delta_tool_call.function.arguments

                if delta.content is not None:  # content
                    yield Event('content', delta.content)
                    content += delta.content
                
            yield Event("content", "\n")
            if len(idx_to_tool_call) > 0:
                self._messages.append({
                    "role": "assistant",
                    "tool_calls": [tool_call for tool_call in idx_to_tool_call.values()],
                    "content": content
                })
                
                for idx in idx_to_tool_call:
                    self.log.normal_log.info(f"tool call: {json.dumps(idx_to_tool_call[idx])}")
                    func_name = idx_to_tool_call[idx]['function']['name']
                    func_args = json.loads(idx_to_tool_call[idx]['function']['arguments'])
                    client = self._tool_register.get_client(func_name)
                    func_result = await client.call_tool(func_name, func_args)
                    func_result_content = "".join(
                        [content.text for content in client.get_result_contents(func_result)])
                    yield Event("tool", tool_call=ToolCallEvent(func_name, func_args, parser_to_json(func_result_content), content))
                    self._messages.append({
                        "role": "tool",
                        "tool_call_id": idx_to_tool_call[idx]['id'],
                        "content": func_result_content
                    })   
            else:
                self._messages.append({
                    "role": "assistant",
                    "content": content
                })
                print(content)
                break
        self._save_session()
        print("end")
            

async def main(session_id: str, user_prompt: str):
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    llm_client = ChatOpenAI('Qwen/Qwen3.5-397B-A17B')
    # llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')
    async_agent = ChatBIAgent(llm_client, tool_register, session_id, user_prompt)
    async for msg in async_agent.stream_run():
        print(msg, end='')


if __name__ == "__main__":
    user_prompt = """
请对下面数据库表的数据形成可视化报告
table_schema：llm
table_name: tbl_super_store
        """.strip()

    # user_prompt = "仅保留第一个主题的第一个问题"
    # user_prompt = "你为什么没有使用相应的工具，而是直接生成了报告，先不要着急修正错误去直接使用工具，而是回答我，是哪部分信息让你直接生成报告而不是使用工具"

    session_id = "1"
    asyncio.run(main(session_id, user_prompt))
