# ChatBI Agent

一个基于大语言模型的智能数据分析助手，能够理解用户的自然语言问题，从 PostgreSQL 数据库中获取数据，进行分析和可视化，并生成数据分析报告。

## 功能特性

- **自然语言转 SQL**：将用户的分析问题自动转换为 SQL 查询并执行
- **数据预览**：自动获取数据表结构、字段类型、数据分布等信息
- **智能分析计划**：基于数据特征生成可能感兴趣的分析主题和问题
- **可视化图表**：自动生成合适的数据图表（折线图、柱状图、饼图等）
- **报告生成**：输出完整的 Markdown 数据分析报告

## 技术架构

```
┌────────────────────────────────────────┐
│           Chainlit UI                  │
└────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────┐
│           ChatBIAgent                  │
│  - 对话管理                             │
│  - 工具调用编排                          │
│  - 报告生成                             │ 
└────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌────────────────────┐  ┌────────────────────┐
│ ChatBI MCP Server  │  │ Chart MCP Server   │
│ - data_preview     │  │ - generate_*_*     │
│ - generate_and_    │  │ (AntV)             │
│   execute_sql      │  │                    │
└────────────────────┘  └────────────────────┘
        │                       │
        ▼                       ▼
┌────────────────────┐  ┌────────────────────┐
│ PostgreSQL         │  │ Chart Rendering    │
│ Database           │  │ Service            │
└────────────────────┘  └────────────────────┘
```

## 项目结构

```
chatbi-agent/
├── src/
│   ├── application.py          # Chainlit 应用入口
│   ├── app/
│   │   ├── agent.py             # ChatBI Agent 核心逻辑
│   │   ├── tool_register.py    # 工具注册管理
│   │   ├── basic_agent.py      # 基础 Agent 实现
│   │   ├── schema.py            # 数据结构定义
│   │   └── mcp_clients/
│   │       ├── chatbi_client.py    # ChatBI MCP 客户端
│   │       ├── chart_client.py     # 图表 MCP 客户端
│   │       └── basic_client.py      # 基础 MCP 客户端
│   ├── mcp_servers/
│   │   ├── chatbi_server.py     # ChatBI MCP 服务端
│   │   └── tools/
│   │       ├── data_preview_tool.py        # 数据预览工具
│   │       └── text_to_sql_service.py      # Text2SQL 服务
│   ├── infra/
│   │   ├── llm/
│   │   │   └── chat_openai.py   # LLM 客户端封装
│   │   ├── db/
│   │   │   └── postgres_utils.py # PostgreSQL 工具
│   │   ├── logger.py             # 日志工具
│   │   └── Utils.py              # 通用工具
│   └── prompts/
│       └── system_prompt.md      # Agent 系统提示词
├── bin/
│   ├── deploy_mcp_server.sh      # 部署 MCP 服务脚本
│   └── deploy_application.sh    # 部署应用脚本
├── jupyters/                     # Jupyter notebooks
├── logs/                         # 日志目录
├── stats/                        # 会话状态存储
└── env.template                  # 环境变量模板
```

## 环境要求

- Python 3.10+
- PostgreSQL 数据库
- OpenAI 兼容的 LLM API（如 Kimi、Qwen 等）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/cyntig/chatbi-agent/
cd chatbi-agent
```

### 2. 配置环境变量

复制 `env.template` 为 `.env` 并填写配置：

```bash
cp env.template .env
```

编辑 `.env` 文件：

```env
OPENAI_BASE_URL=https://api.moonshot.cn/v1
OPENAI_API_KEY=your_api_key

POSTGRES_HOST=localhost
POSTGRES_USER=your_user
POSTGRES_PWD=your_password
POSTGRES_DATABASE=your_database
POSTGRES_PORT=5432
```

### 3. 安装依赖

```bash
pip install chainlit fastmcp openai python-dotenv jsonlines
```

### 4. 启动 MCP 服务

```bash
bash bin/deploy_mcp_server.sh
```

服务将在 `http://localhost:8000` 启动。

### 5. 启动 ChatBI 应用

```bash
bash bin/deploy_application.sh
```

### 6. 使用

1. 打开浏览器访问 `http://localhost:9000`
2. 输入数据库表信息，例如：

```
请对下面数据库表的数据形成可视化报告
table_schema：llm
table_name: tbl_super_store
```

3. Agent 会：
   - 获取数据预览
   - 生成分析计划并等待确认
   - 执行 SQL 分析
   - 生成可视化图表
   - 输出分析报告

## 可用工具

| 工具名称 | 描述 |
|---------|------|
| `data_preview` | 获取数据表结构、字段类型、数据分布 |
| `generate_and_execute_sql` | 将自然语言转换为 SQL 并执行 |
| `generate_line_chart` | 生成折线图 |
| `generate_bar_chart` | 生成柱状图 |
| `generate_pie_chart` | 生成饼图 |
| `generate_scatter_chart` | 生成散点图 |

## 配置说明

### LLM 模型

在 `application.py` 中修改模型：

```python
llm_client = ChatOpenAI('moonshotai/Kimi-K2-Instruct-0905')
# 或
llm_client = ChatOpenAI('Qwen/Qwen3.5-397B-A17B')
```

### MCP 服务地址

- ChatBI 服务：`http://127.0.0.1:8001/mcp`
- Chart 服务：使用 `@antv/mcp-server-chart` (通过 npx 运行)

## 开发说明

### 运行测试

```bash
cd src
python -m app.agent
```

### 日志查看

日志文件位于 `logs/` 目录：

- `generate_and_execute_sql_log.jsonl` - SQL 生成日志
- `text.jsonl` - 文本交互日志

### 会话状态

会话状态保存在 `stats/session_stats.jsonl`，支持会话恢复。

## 添加 MCP 服务

### 1. 创建 MCP 服务端

在 `src/mcp_servers/` 目录下创建新的服务文件，例如 `my_server.py`：

```python
from fastmcp import FastMCP

server = FastMCP("my-mcp-server")

@server.tool(name='my_tool')
def my_tool(param: str) -> str:
    """工具描述"""
    return f"结果: {param}"

if __name__ == "__main__":
    server.run(transport="http", host="0.0.0.0", port=8001)
```

### 2. 创建 MCP 客户端

在 `src/app/mcp_clients/` 目录下创建对应的客户端，例如 `my_client.py`：

```python
from fastmcp import Client
from app.mcp_clients.basic_client import BasicClient
from fastmcp.client.transports import StreamableHttpTransport

class MyClient(BasicClient):
    def _create_client(self) -> Client:
        transport = StreamableHttpTransport(
            url="http://127.0.0.1:8001/mcp",
        )
        return Client(transport)
```

### 3. 注册工具

在 `src/app/tool_register.py` 中添加工具注册：

```python
from app.mcp_clients.my_client import MyClient

# 在 ToolRegister 中添加
tool_register = ToolRegister(ChartClient(), ChatBIClient(), MyClient())
```

### 4. 启动服务

更新启动脚本或在 `bin/` 目录下创建新的部署脚本。

## License

Copyright (c) 2026 cyntig
