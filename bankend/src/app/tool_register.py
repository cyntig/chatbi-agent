import asyncio
from typing import Union

from app.mcp_clients.basic_client import BasicClient
from app.mcp_clients.chart_client import ChartClient
from app.mcp_clients.chatbi_client import ChatBIClient
from agents.mcp.util import MCPUtil
from agents.mcp.server import MCPServerStreamableHttpParams, MCPServerStreamableHttp
from agents.models.chatcmpl_converter import Converter

class ToolRegister:
    def __init__(self, *clients):
        self.clients = clients
        self._mcp_tools = []
        self._name_to_client = {}
        self._initialized = False

    async def initialize(self):
        """异步初始化方法，加载工具列表"""
        if self._initialized:
            return
        await self._load_tools()
        self._initialized = True

    def _converter(self, mcp_tool):
        # schema = {
        #     "type": "function",
        #     "function": {
        #         "name": mcp_tool.name,
        #         "description": mcp_tool.description,
        #         "parameters": mcp_tool.inputSchema
        #     }
        # }
        # return schema
        function_tool = MCPUtil.to_function_tool(
            mcp_tool,
            # 如果只使用转换后的工具列表的话，server可以留空
            server=MCPServerStreamableHttp(
                params=MCPServerStreamableHttpParams(
                    url='http://localhost:8001/mcp'
                ),
            ),
            convert_schemas_to_strict=True,
        )
        openai_tool = Converter.tool_to_openai(function_tool)
        return openai_tool

    

    async def _load_tools(self):
        for client in self.clients:
            mcp_tools = await client.list_tools()
            self._mcp_tools.extend(mcp_tools)
            for mcp_tool in mcp_tools:
                self._name_to_client[mcp_tool.name] = client
    
    def get_client(self, tool_name) -> BasicClient:
        return self._name_to_client[tool_name]
    
    def list_tools(self):
        return [self._converter(mcp_tool) for mcp_tool in self._mcp_tools]
    

if __name__ == "__main__":
    async def main():
        tool_register = ToolRegister(ChartClient())
        await tool_register.initialize()
        # print(*tool_register._mcp_tools, sep='\n')
        # print(tool_register._name_to_client)
        tools = tool_register.list_tools()
        print(len(tools))
        print(*tool_register.list_tools(), sep='\n')
        # print(tool_register.call_tool("data_preview", {'tbl_schema':'llm', 'tbl_name':'tbl_super_store'}))
    
    asyncio.run(main())
