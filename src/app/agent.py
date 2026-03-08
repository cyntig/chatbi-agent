from datetime import datetime
import json
from app.tool_register import ToolRegister
from app.mcp_clients.chatbi_client import ChatBIClient
from app.mcp_clients.chart_client import ChartClient
from infra.llm.chat_openai import ChatOpenAI
import jsonlines
import asyncio
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class ChatBIAgent:
    def __init__(self,
                 llmClient: ChatOpenAI,
                 tool_register: ToolRegister,
                 session_id: str,
                 user_prompt: str,
                 max_round: int = -1):
        self._user_prompt = user_prompt
        self._sys_prompt = self._load_sys_prompt()
        self._states = self._load_state()
        self._tool_register = tool_register
        self._llmClient = llmClient
        self._session_id = session_id
        self._max_round = max_round
        self._init_message()
        print(self._messages)
        
    
    def _load_sys_prompt(self):
        with open("prompts/system_prompt.md", "r", encoding="utf-8") as f:
            content = f.read()
        return content

    def _init_message(self):
        if self._session_id in self._states:
            session_states = self._states[self._session_id]
            latest_state = session_states[-1]
            self._messages = latest_state["messages"].copy()
        else:
            self._messages = [{'role': 'system', 'content': self._sys_prompt}]

        self._messages.append({'role': 'user', 'content': self._user_prompt})

    def _update_state(self):
        state = {
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
            "messages": self._messages
        }
        if self._session_id not in self._states:
            self._states[self._session_id] = []
        self._states[self._session_id].append(state)

    async def run(self):
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
            
            print(f"Round {round}") 
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

        self._update_state()
        self._save_state(self._states)

        return response_content


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


    def _save_state(self, states: dict):
        file_path = "../stats/session_stats.jsonl"
        
        with jsonlines.open(file_path, mode='w') as writer:
            for session_id, session_states in states.items():
                for i, state in enumerate(session_states):
                    session_states[i]["session_id"] = session_id
                    writer.write(session_states[i])





def main(session_id: str, user_prompt: str):
    tool_register = ToolRegister(ChartClient(), ChatBIClient())
    llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')

    agent = ChatBIAgent(llm_client, tool_register, session_id, user_prompt)
    print(asyncio.run(agent.run()))


if __name__ == "__main__":
    user_prompt = """
请对下面数据库表的数据形成可视化报告
table_schema：llm
table_name: tbl_super_store
        """.strip()

    # user_prompt = "仅保留第一个主题的第一个问题"
    # user_prompt = "你为什么没有使用相应的工具，而是直接生成了报告，先不要着急修正错误去直接使用工具，而是回答我，是哪部分信息让你直接生成报告而不是使用工具"

    session_id = "1"
    main(session_id, user_prompt)
