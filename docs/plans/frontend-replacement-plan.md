# ChatBI 前端替换方案：Vue 3 + FastAPI 替代 Chainlit

## Context

ChatBI Agent 当前使用 Chainlit 同时作为 UI 和后端服务器。Chainlit 的自定义能力有限，无法满足更复杂的 UI 需求（如会话管理、BI 仪表盘式布局等）。本方案将 Chainlit 替换为 **Vue 3 + TypeScript** 前端 + **FastAPI** 后端 API，复用现有的 `ChatBIAgent` 核心逻辑和 MCP 架构。

---

## 整体架构

```
Vue 3 Frontend (port 5173)  ──SSE──>  FastAPI Backend (port 8080)
                                          │
                                     ChatBIAgent (复用现有)
                                          │
                                     ToolRegister → MCP Clients
                                          │
                              ┌───────────┴──────────┐
                         ChatBI MCP Server      Chart MCP Server
                         (PostgreSQL)           (AntV)
```

---

## 一、项目目录结构

```
chatbi-agent/
├── frontend/                          # 新增：Vue 3 前端
│   ├── package.json
│   ├── vite.config.ts                 # 配置 /api 代理到 FastAPI
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts
│       ├── App.vue
│       ├── router/index.ts
│       ├── stores/
│       │   ├── chat.ts               # 聊天消息状态 (Pinia)
│       │   └── session.ts            # 会话列表状态 (Pinia)
│       ├── composables/
│       │   └── useSSE.ts             # SSE 流式连接
│       ├── services/
│       │   └── api.ts                # HTTP + SSE API 客户端
│       ├── types/index.ts            # TypeScript 类型定义
│       ├── components/
│       │   ├── layout/
│       │   │   ├── AppSidebar.vue    # 左侧会话列表
│       │   │   └── AppHeader.vue
│       │   ├── chat/
│       │   │   ├── ChatContainer.vue # 主聊天区域
│       │   │   ├── MessageList.vue   # 消息列表（可滚动）
│       │   │   ├── MessageItem.vue   # 单条消息
│       │   │   ├── MessageInput.vue  # 输入框 + 发送按钮
│       │   │   ├── ToolCallCard.vue  # 可折叠的工具调用卡片
│       │   │   ├── MarkdownRenderer.vue  # Markdown 渲染
│       │   │   ├── ChartImage.vue    # 图表图片展示
│       │   │   └── StreamingIndicator.vue
│       │   └── session/
│       │       ├── SessionList.vue
│       │       └── SessionItem.vue
│       └── styles/
│           ├── main.css
│           └── variables.css
│
├── src/                               # 后端（在现有基础上修改）
│   ├── server.py                      # 新增：FastAPI 入口
│   ├── api/                           # 新增：API 层
│   │   ├── __init__.py
│   │   ├── schemas.py                # Pydantic 请求/响应模型
│   │   ├── dependencies.py           # 共享依赖（SessionManager 单例）
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── chat.py               # POST /api/chat → SSE 流
│   │       └── session.py            # 会话 CRUD
│   ├── app/
│   │   ├── session_manager.py        # 新增：从 agent 提取的会话管理
│   │   ├── agent.py                  # 小改：使用 SessionManager，修复路径
│   │   └── ...（其余不变）
│   └── ...（infra/, mcp_servers/, prompts/ 不变）
```

---

## 二、FastAPI 后端设计

### 2.1 API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/chat` | 发送消息，返回 SSE 流式响应 |
| `GET` | `/api/sessions` | 获取会话列表 |
| `GET` | `/api/sessions/{id}` | 获取会话详情（含完整消息历史） |
| `POST` | `/api/sessions` | 创建新会话 |
| `DELETE` | `/api/sessions/{id}` | 删除会话 |
| `PATCH` | `/api/sessions/{id}` | 重命名会话 |

### 2.2 SSE 事件协议

前端通过 `POST /api/chat` 获取 SSE 流，事件类型：

```
event: content
data: {"text": "根据数据分析..."}       # 流式文本片段

event: tool_end
data: {"name": "generate_and_execute_sql", "arguments": {...}, "output": {...}}  # 工具调用结果

event: done
data: {"session_id": "xxx"}             # 流结束

event: error
data: {"message": "LLM request failed"} # 错误
```

**与 Agent Event 的映射关系：**
- `Event(type='content')` → `event: content`
- `Event(type='tool')` → `event: tool_end`
- 流结束 → `event: done`
- 异常 → `event: error`

### 2.3 核心流式端点 (`src/api/routes/chat.py`)

直接复用 `ChatBIAgent.stream_run()` —— 它已经与 Chainlit 解耦，是纯 async generator：

```python
@router.post("/api/chat")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        agent = ChatBIAgent(llm_client, tool_register, request.session_id, request.message)
        async for event in agent.stream_run():
            if event.type == 'content':
                yield f"event: content\ndata: {json.dumps({'text': event.content})}\n\n"
            elif event.type == 'tool':
                yield f"event: tool_end\ndata: {json.dumps({...})}\n\n"
        yield f"event: done\ndata: ...\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

### 2.4 新增 SessionManager (`src/app/session_manager.py`)

从 `ChatBIAgent` 中提取会话持久化逻辑为独立类，供 API 和 Agent 共用：
- `list_sessions()` → 返回会话列表（id, title, updated_at）
- `get_session(id)` → 返回完整消息历史
- `delete_session(id)` / `update_title(id, title)`
- 使用线程锁保证并发安全

### 2.5 Agent 需要的修改（最小改动）

1. **修复相对路径**：`"../stats/session_stats.jsonl"` 和 `"prompts/system_prompt.md"` 改为基于项目根目录的绝对路径
2. **委托 SessionManager**：`_load_state()` / `_save_state()` 委托给 `SessionManager`
3. **确认异步流**：检查 `ChatOpenAI.stream_chat()` 是否阻塞事件循环，如需要则切换到异步版本

---

## 三、Vue 3 前端设计

### 3.1 技术栈
- Vue 3 + `<script setup>` + Composition API
- TypeScript
- Pinia（状态管理）
- Vue Router（路由）
- markdown-it + highlight.js（Markdown 渲染）
- Vite（构建）
- 不使用重型 UI 库，自定义 CSS 实现 ChatGPT 风格

### 3.2 UI 布局（类 ChatGPT）

```
┌──────────────┬──────────────────────────────────────────┐
│  + 新对话    │                                          │
│──────────────│                                          │
│ ● 数据分析报告│        消息列表（居中，最大768px）         │
│ ● 销售趋势   │                                          │
│ ● 库存分析   │   用户: 请对 tbl_super_store 生成分析报告  │
│              │                                          │
│              │   助手: 我将首先获取表结构...               │
│              │   ┌─ 🔧 data_preview ──────────┐         │
│              │   │ Input: {schema, table}      │         │
│              │   │ Output: {columns: [...]}    │         │
│              │   └────────────────────────────┘         │
│              │   根据分析，该表包含以下字段...             │
│              │   [图表图片]                              │
│              │                                          │
│              ├──────────────────────────────────────────┤
│              │  [输入框...          ]  [发送]            │
└──────────────┴──────────────────────────────────────────┘
```

### 3.3 核心组件

**MarkdownRenderer.vue**：
- 使用 `markdown-it` + `highlight.js` 渲染
- 流式输出时每 100ms debounce 渲染，避免闪烁
- 图片 `![](url)` 自动用 `ChartImage` 组件渲染

**ToolCallCard.vue**：
- 可折叠卡片，默认收起
- 显示工具名称、输入参数（JSON）、输出结果（JSON，可截断）
- 带展开/收起动画

**MessageInput.vue**：
- 自动增高的 textarea
- Enter 发送，Shift+Enter 换行
- 流式输出中显示"停止"按钮

**ChartImage.vue**：
- 加载骨架屏 → 图片展示
- 点击放大查看
- 错误兜底显示

### 3.4 SSE 连接（`useSSE.ts`）

由于 `EventSource` 仅支持 GET，使用 `fetch` + `ReadableStream` 实现 POST SSE：

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ session_id, message }),
  signal: abortController.signal,
})
const reader = response.body.getReader()
// 逐块解析 SSE 事件，分发给 handlers
```

### 3.5 路由

```typescript
const routes = [
  { path: '/', component: ChatView },                  // 新会话
  { path: '/chat/:sessionId', component: ChatView },   // 具体会话
]
```

---

## 四、实施顺序

### Phase 1：后端 API（用 curl 测试，不依赖前端）

| # | 文件 | 操作 | 说明 |
|---|------|------|------|
| 1 | `src/app/session_manager.py` | 新建 | 提取会话管理逻辑 |
| 2 | `src/app/agent.py` | 修改 | 使用 SessionManager，修复路径 |
| 3 | `src/api/schemas.py` | 新建 | Pydantic 模型 |
| 4 | `src/api/dependencies.py` | 新建 | 共享依赖 |
| 5 | `src/api/routes/chat.py` | 新建 | SSE 流式端点 |
| 6 | `src/api/routes/session.py` | 新建 | 会话 CRUD |
| 7 | `src/server.py` | 新建 | FastAPI 入口 |
| 8 | `bin/deploy_server.sh` | 新建 | 启动脚本 |

### Phase 2：前端脚手架

| # | 文件 | 说明 |
|---|------|------|
| 9 | `frontend/` | `npm create vue@latest` 初始化项目 |
| 10 | `vite.config.ts` | 配置 `/api` 代理 |
| 11 | `types/index.ts` | TypeScript 类型 |
| 12 | `services/api.ts` | API 客户端 |
| 13 | `composables/useSSE.ts` | SSE 流式连接 |
| 14 | `styles/` | CSS 变量和全局样式 |

### Phase 3：前端核心组件

| # | 组件 | 说明 |
|---|------|------|
| 15 | stores (chat + session) | Pinia 状态管理 |
| 16 | AppSidebar + SessionList | 会话列表 |
| 17 | ChatContainer + MessageList + MessageItem | 核心聊天 |
| 18 | MessageInput | 输入框 |
| 19 | MarkdownRenderer | Markdown 渲染 |
| 20 | ToolCallCard | 工具调用卡片 |
| 21 | ChartImage | 图表展示 |
| 22 | App.vue + router | 组装 |

### Phase 4：集成 & 打磨

- 端到端测试完整流程
- 自动滚动行为（流式输出时跟随，用户上翻时暂停）
- 错误处理（网络、LLM 超时、MCP 故障）
- 响应式布局适配

---

## 五、过渡策略

- **保留 `application.py`（Chainlit）**：不做任何修改，现有部署继续可用
- **新增 `server.py`（FastAPI）**：独立端口 8080，与 Chainlit 无冲突
- 两者共享同一个 `ChatBIAgent`、`session_stats.jsonl`、MCP 服务器
- 待新前端稳定后再移除 Chainlit 依赖

---

## 六、依赖

**Python 新增：**
```
fastapi>=0.115
uvicorn[standard]>=0.34
```

**前端：**
```
vue@^3.5, vue-router@^4.5, pinia@^3.0
markdown-it@^14.0, highlight.js@^11.10
vite@^6.0, typescript@^5.7
```

---

## 七、验证方式

1. **后端验证**：`curl -X POST http://localhost:8080/api/chat -d '{"session_id":"test","message":"hello"}' -H 'Content-Type: application/json'` → 应收到 SSE 流
2. **前端验证**：`npm run dev` → 浏览器打开 → 新建会话 → 发送消息 → 验证流式输出、工具卡片、图表展示
3. **会话管理**：创建多个会话 → 切换 → 验证历史消息正确加载
4. **完整流程**：发送 "请对 llm.tbl_super_store 生成分析报告" → 验证数据预览 → SQL 执行 → 图表生成 → 报告展示
