import asyncio
from app.mcp_clients.basic_client import BasicClient
from fastmcp import Client
from fastmcp.client.transports import StreamableHttpTransport

class ChatBIClient(BasicClient):
    def _create_client(self) -> Client:
        transport = StreamableHttpTransport(
            url="http://127.0.0.1:8000/mcp",
        )
        return Client(transport)
    

if __name__ == "__main__":
    chattbi_client = ChatBIClient()
    print(asyncio.run(chattbi_client.list_tools()))
    