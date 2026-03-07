import abc

from agentstr.relays.relay import asyncio
from fastmcp import Client


class BasicClient(abc.ABC):
    @abc.abstractmethod
    def _create_client(self) -> Client:
        """
        子类实现：创建 MCP Client
        """
        pass

    
    async def list_tools(self):
        """
        获取 MCP server 的工具列表
        """
        client = self._create_client()
        async with client:
            return await client.list_tools()
            
        
    async def call_tool(self, name: str, arguments: dict):
        """
        调用 MCP tool
        """
        client = self._create_client()
        async with client:
            result = await client.call_tool(
                name=name,
                arguments=arguments
            )
            return result
        
    def get_result_contents(self, result):
        return result.content