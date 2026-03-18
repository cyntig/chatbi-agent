
from fastmcp import Client
from app.mcp_clients.basic_client import BasicClient
from fastmcp.client.transports import StdioTransport

import asyncio


class ChartClient(BasicClient):
    def _create_client(self) -> Client:
        return Client(
            StdioTransport(
                command="npx",
                args=["-y", "@antv/mcp-server-chart"]
            )
        )
        

if __name__ == "__main__":
    chart_client = ChartClient()
    print(asyncio.run(chart_client.list_tools()))