import asyncio
from datetime import datetime
import json
from typing import Literal
from app.tool_register import ToolRegister
from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from app.session_manager import SessionManager
from infra.llm.chat_openai import ChatOpenAI
from infra.logger import logger
from logging import Logger
from infra.Utils import parser_to_json
import jsonlines
import sys
import os
from app.schema import Event, ToolCallEvent
from config import cfg
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

log: Logger = logger("standard")
stream_log: Logger = logger("stream")

class ChatBIAgent:
    def __init__(self,
                 llm_client: ChatOpenAI,
                 tool_register: ToolRegister,
                 session_manager: SessionManager,
                 session_id: str,
                 user_prompt: str,
                 max_round: int = -1):
        self._user_prompt = user_prompt
        self._sys_prompt = self._load_sys_prompt()
        self._session_manager = session_manager
        self._tool_register = tool_register
        self._llmClient = llm_client
        self._session_id = session_id
        self._max_round = max_round
        self._init_message()

    def _load_sys_prompt(self):
        with open("prompts/system_prompt.md", "r", encoding="utf-8") as f:
            content = f.read()
        return content

    def _init_message(self):
        existing_messages = self._session_manager.get_messages(self._session_id)
        if existing_messages:
            self._messages = existing_messages
        else:
            self._messages = [{'role': 'system', 'content': self._sys_prompt}]

        self._messages.append({'role': 'user', 'content': self._user_prompt})

    async def stream_run(self):
        round = 0
        tools = self._tool_register.list_tools()

        while self._max_round == -1 or round < self._max_round:
            round += 1
            log.info(f"Round {round}")

            content = ""
            idx_to_tool_call = {}
            # asyn_stream_chat 是异步生成器，直接用 async for 迭代
            async for delta in self._llmClient.asyn_stream_chat(
                self._messages,
                temperature=0.3,
                tools=tools,
                tool_choice='auto'
            ):
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
                    yield Event(type='text', content=delta.content)
                    content += delta.content
                
            yield Event(type='text', content="\n")
            if len(idx_to_tool_call) > 0:
                self._messages.append({
                    "role": "assistant",
                    "tool_calls": [tool_call for tool_call in idx_to_tool_call.values()],
                    "content": content
                })
                
                for idx in idx_to_tool_call:
                    log.info(f"tool call: {json.dumps(idx_to_tool_call[idx])}")
                    func_name = idx_to_tool_call[idx]['function']['name']
                    func_args = json.loads(idx_to_tool_call[idx]['function']['arguments'])
                    client = self._tool_register.get_client(func_name)
                    func_result = await client.call_tool(func_name, func_args)
                    result_contents = client.get_result_contents(func_result)
                    func_result_content = "".join(
                        [item.text if hasattr(item, 'text') else str(item) for item in result_contents])  # type: ignore[no-matching-overload]
                    yield Event(type="tool", tool_call=ToolCallEvent(
                        name=func_name, 
                        arguments=str(func_args), 
                        output=func_result_content, 
                        content=content
                    ))
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
                break
        self._save_state()
        log.info(f"Session {self._session_id} running completed.")
            
    def _load_state(self):
        states = {}
        file_path = "../stats/session_stats.jsonl"
        if os.path.exists(file_path):
            with jsonlines.open(file_path) as reader:
                for line in reader:
                    if line['session_id'] not in states:
                        states[line['session_id']] = []
                    states[line['session_id']].append({
                        "update_time": line['update_time'],
                        "messages": line['messages']
                    })
        return states

    def _save_state(self):
        self._session_manager.save_state(self._session_id, self._messages)


async def main(session_id: str, user_prompt: str):
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    await tool_register.initialize()  # 异步初始化工具注册器
    agent_model = cfg.llm_model['agent_model']
    print("agent model: " + agent_model)
    llm_client = ChatOpenAI(agent_model)
    session_manager = SessionManager()
    async_agent = ChatBIAgent(llm_client, tool_register, session_manager, session_id, user_prompt)
    async for msg in async_agent.stream_run():
        # print(msg.model_dump())
        if msg.type == "text":
            print(msg.content, end="", flush=True)
        else:
            print(type(msg.tool_call.output))
            print(msg.tool_call.output)
        


if __name__ == "__main__":
    user_prompt = """
请对下面数据库表的数据形成可视化报告
table_schema：llm
table_name: tbl_super_store
        """.strip()

    # user_prompt = "保留第一个主题的第一个问题"
    # user_prompt= "ok"


    session_id = "1"
    asyncio.run(main(session_id, user_prompt))
