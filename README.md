# ChatBI Agent

<p align="center">
  <strong>🤖 AI 驱动的智能数据分析助手</strong>
</p>

<p align="center">
  通过自然语言对话，自动完成数据分析、SQL 生成、图表可视化，并输出完整的数据分析报告。
</p>

---

## 📖 项目简介

ChatBI Agent 是一个全栈 AI 数据分析应用，用户只需提供数据库表名和 schema，系统即可：

1. **数据预览** — 自动获取数据概览，理解数据结构
2. **分析计划** — 拆解用户可能感兴趣的分析问题，按主题组织
3. **SQL 生成与执行** — 将自然语言问题转化为 PostgreSQL 查询并执行
4. **图表可视化** — 根据分析结果自动选择合适的图表类型
5. **报告生成** — 输出包含数据表格、可视化图表和结论的 Markdown 分析报告

系统基于 MCP（Model Context Protocol）协议进行工具调用，支持流式响应（SSE），提供实时的对话体验。

## ✨ 核心特性

- 🗣️ **自然语言交互** — 用对话的方式进行数据分析，无需编写 SQL
- 📊 **自动可视化** — 根据分析结果智能选择图表类型并生成
- 🔄 **流式响应** — 基于 SSE 的实时流式输出，体验流畅
- 🧠 **多模型支持** — 支持 Kimi、Qwen 等 OpenAI 兼容的 LLM
- 💾 **会话管理** — 支持多会话创建、切换、历史记录持久化
- 🎨 **明暗主题** — 支持 Light / Dark 主题切换
- 🔧 **MCP 工具链** — 可扩展的工具注册与调用机制

## 🏗️ 系统架构

```
┌──────────────────────────────────────────────┐
│           Frontend (Vue 3 + TypeScript)       │
│              http://localhost:3000            │
│  Pinia 状态管理 · Naive UI · TailwindCSS      │
└────────────────────┬─────────────────────────┘
                     │ Axios / SSE
┌────────────────────▼─────────────────────────┐
│           Backend API (FastAPI)               │
│              http://localhost:8000            │
│  ChatBIAgent · SessionManager · ToolRegister  │
└────────────────────┬─────────────────────────┘
                     │ MCP Protocol
┌────────────────────▼─────────────────────────┐
│           MCP Servers                         │
│              http://localhost:8001            │
│  data_preview · text_to_sql · chart_gen       │
└────────────────────┬─────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   PostgreSQL / LLM API  │
        └─────────────────────────┘
```

## 📂 项目结构

```
chatbi-agent/
├── bin/                        # 启动/停止/状态管理脚本
│   ├── start_all.sh            # 一键启动所有服务
│   ├── stop_all.sh             # 停止所有服务
│   └── status.sh               # 查看服务状态
│
├── bankend/                    # 后端 (Python)
│   ├── src/
│   │   ├── main.py             # FastAPI 入口
│   │   ├── config.yaml         # 应用配置
│   │   ├── api/routers/        # API 路由 (chat, session)
│   │   ├── app/                # 业务逻辑
│   │   │   ├── agent.py        # ChatBI Agent 核心
│   │   │   ├── session_manager.py  # 会话管理
│   │   │   ├── tool_register.py    # 工具注册
│   │   │   └── mcp_clients/    # MCP 客户端
│   │   ├── infra/              # 基础设施 (LLM, DB, Logger)
│   │   ├── mcp_servers/        # MCP 服务端 & 工具定义
│   │   └── prompts/            # 系统提示词
│   └── requirements.txt
│
├── frontend/                   # 前端 (Vue 3)
│   ├── src/
│   │   ├── api/                # API 客户端
│   │   ├── components/         # Vue 组件
│   │   │   ├── chat/           # 聊天界面组件
│   │   │   ├── session/        # 会话管理组件
│   │   │   ├── layout/         # 布局组件
│   │   │   └── common/         # 通用组件
│   │   ├── composables/        # 组合式函数
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── views/              # 页面视图
│   │   └── router/             # 路由配置
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                       # 项目文档
│   ├── API_DOCUMENTATION.md    # API 接口文档
│   └── BACKEND_STARTUP.md      # 后端启动指南
│
└── env.template                # 环境变量模板
```

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 · TypeScript · Vite · Pinia · Vue Router · Naive UI · TailwindCSS |
| **后端** | Python · FastAPI · Uvicorn · Pydantic · OpenAI SDK |
| **数据** | PostgreSQL · SQLAlchemy · JSONL (会话存储) |
| **AI/LLM** | Kimi (kimi-k2.5) · Qwen (qwen3.5-plus) · OpenAI 兼容接口 |
| **协议** | MCP (Model Context Protocol) · SSE (Server-Sent Events) |

## 🚀 快速开始

### 环境要求

- Python 3.8+
- Node.js 18+
- PostgreSQL（可选，用于数据分析目标库）

### 1. 克隆项目

```bash
git clone <repo-url>
cd chatbi-agent
```

### 2. 配置环境变量

```bash
cp env.template .env
```

编辑 `.env` 文件，填写必要配置：

```env
# LLM API 配置
OPENAI_BASE_URL=https://your-llm-api-endpoint/v1
OPENAI_API_KEY=sk-your-api-key

# PostgreSQL 数据库（可选）
POSTGRES_HOST=localhost
POSTGRES_USER=your_user
POSTGRES_PWD=your_password
POSTGRES_DATABASE=your_db
POSTGRES_PORT=5432
```

### 3. 安装依赖

```bash
# 后端
cd bankend
pip install -r requirements.txt

# 前端
cd ../frontend
npm install
```

### 4. 启动服务

**方式一：一键启动（推荐）**

```bash
chmod +x bin/*.sh
./bin/start_all.sh
```

**方式二：手动分别启动**

```bash
# 终端 1 — MCP 服务
cd bankend/src/mcp_servers
python3 chatbi_server.py

# 终端 2 — 后端 API
cd bankend/src
python3 main.py

# 终端 3 — 前端
cd frontend
npm run dev
```

### 5. 访问应用

| 服务 | 地址 |
|------|------|
| 前端界面 | http://localhost:3000 |
| 后端 API | http://localhost:8000 |
| API 文档 (Swagger) | http://localhost:8000/docs |
| MCP 服务 | http://localhost:8001 |

## 📡 API 接口

### 聊天（SSE 流式）

```
GET /api/chatbi/chat?session_id={id}&message={text}
```

返回 `text/event-stream`，事件类型包括：
- `text` — AI 文本回复
- `tool` — 工具调用信息
- `error` — 错误信息

### 会话管理

```
GET    /api/chatbi/sessions          # 获取会话列表
GET    /api/chatbi/sessions/{id}     # 获取会话详情
POST   /api/chatbi/sessions          # 创建新会话
PATCH  /api/chatbi/sessions/{id}     # 更新会话标题
DELETE /api/chatbi/sessions/{id}     # 删除会话
```

> 完整 API 文档请参阅 [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

## ⚙️ 配置说明

### LLM 模型配置

在 `bankend/src/config.yaml` 中配置使用的模型：

```yaml
llm_model:
  mcp_model: qwen3.5-plus    # MCP 工具调用模型
  agent_model: kimi-k2.5      # 主 Agent 对话模型
```

### 日志配置

```yaml
logging:
  level: DEBUG
  dir: ../logs
  common_file: app.log
  postgres_file: postgres.log
```

## 🔧 常用命令

```bash
# 服务管理
./bin/start_all.sh          # 启动所有服务
./bin/stop_all.sh           # 停止所有服务
./bin/status.sh             # 查看服务状态

# 前端开发
cd frontend
npm run dev                 # 启动开发服务器
npm run build               # 构建生产版本
npm run preview             # 预览生产构建
npm run lint                # 代码检查与修复
```

## 🐛 常见问题

| 问题 | 解决方案 |
|------|---------|
| 端口被占用 | 先执行 `./bin/stop_all.sh`，或修改对应服务的端口配置 |
| 依赖安装失败 | 确认 Python/Node 版本，尝试 `pip install --upgrade pip` |
| CORS 跨域错误 | 检查 `main.py` 中 CORS 中间件配置 |
| SSE 连接断开 | 前端已内置重连机制，检查后端服务是否正常运行 |
| LLM API 报错 | 确认 `.env` 中 API Key 和 Base URL 配置正确 |
| 会话数据丢失 | 确认 `bankend/stats/` 目录存在且有写入权限 |

## 📄 License

本项目仅供学习与研究使用。
