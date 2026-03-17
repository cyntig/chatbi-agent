# ChatBI Agent API 接口文档

> **Base URL**: `http://localhost:8000`
>
> **版本**: 1.0.0
>
> **协议**: HTTP / SSE (Server-Sent Events)

---

## 目录

- [1. 概述](#1-概述)
- [2. 通用说明](#2-通用说明)
- [3. 健康检查](#3-健康检查)
- [4. 聊天接口](#4-聊天接口)
- [5. 会话管理接口](#5-会话管理接口)
  - [5.1 获取会话列表](#51-获取会话列表)
  - [5.2 创建会话](#52-创建会话)
  - [5.3 获取会话详情](#53-获取会话详情)
  - [5.4 更新会话](#54-更新会话)
  - [5.5 删除会话](#55-删除会话)
- [6. 数据模型](#6-数据模型)
- [7. 错误处理](#7-错误处理)

---

## 1. 概述

ChatBI Agent API 是一个基于 FastAPI 构建的后端服务，提供智能数据分析对话能力。用户可以通过自然语言与系统交互，系统会自动调用数据查询和图表生成等工具，以 SSE 流式方式返回分析结果。

**技术栈**：

- 后端框架：FastAPI
- LLM 集成：OpenAI 兼容接口（SiliconFlow / Kimi）
- 工具系统：MCP (Model Context Protocol) 服务
- 会话存储：JSONL 文件持久化

---

## 2. 通用说明

### 请求格式

- `Content-Type: application/json`（POST / PATCH 请求）
- 路径参数使用 `{param}` 形式

### CORS 配置

允许的跨域来源：

- `http://localhost:5173`
- `http://localhost:3000`
- `http://127.0.0.1:5173`

### 响应格式

除聊天接口返回 SSE 流外，其余接口均返回标准 JSON 响应。

---

## 3. 健康检查

### `GET /api/health`

检查服务是否正常运行。

**请求示例**：

```bash
curl http://localhost:8000/api/health
```

**响应**：

```json
{
  "status": "ok"
}
```

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 服务正常运行 |

---

## 4. 聊天接口

### `POST /api/chat`

发送用户消息，返回 SSE（Server-Sent Events）流式响应。系统会调用 LLM 进行分析，并可能触发工具调用（数据查询、图表生成等）。

**请求头**：

```
Content-Type: application/json
```

**请求体**：

| 字段         | 类型   | 必填 | 默认值                                | 说明                       |
| ------------ | ------ | ---- | ------------------------------------- | -------------------------- |
| `session_id` | string | ✅   | -                                     | 会话 ID，用于关联上下文     |
| `message`    | string | ✅   | -                                     | 用户发送的消息内容          |
| `model`      | string | ❌   | `moonshotai/Kimi-K2-Instruct-0905`   | 使用的 LLM 模型标识        |

**请求示例**：

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "message": "帮我查看销售数据的趋势",
    "model": "moonshotai/Kimi-K2-Instruct-0905"
  }'
```

**响应格式**：

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

**SSE 事件类型**：

#### `content` — 文本片段

LLM 生成的文本内容，逐片段推送。

```
event: content
data: {"text": "根据数据分析，"}

event: content
data: {"text": "销售额在第三季度呈现上升趋势..."}
```

| 字段   | 类型   | 说明                 |
| ------ | ------ | -------------------- |
| `text` | string | 流式输出的文本片段    |

#### `tool_end` — 工具调用结果

当 Agent 调用了 MCP 工具（如数据查询、图表生成）后推送。

```
event: tool_end
data: {"name": "query_data", "arguments": "{\"sql\": \"SELECT ...\"}", "output": "[{\"col1\": \"val1\"}]", "content": "查询结果如下..."}
```

| 字段        | 类型   | 说明                           |
| ----------- | ------ | ------------------------------ |
| `name`      | string | 工具名称                       |
| `arguments` | string | 工具调用参数（JSON 字符串）     |
| `output`    | string | 工具原始输出                   |
| `content`   | string | 工具输出的可展示内容            |

#### `done` — 流式完成

表示本次响应已全部推送完毕。

```
event: done
data: {"session_id": "550e8400-e29b-41d4-a716-446655440000"}
```

| 字段         | 类型   | 说明       |
| ------------ | ------ | ---------- |
| `session_id` | string | 当前会话 ID |

#### `error` — 错误

处理过程中发生异常时推送。

```
event: error
data: {"message": "LLM 调用超时"}
```

| 字段      | 类型   | 说明       |
| --------- | ------ | ---------- |
| `message` | string | 错误信息   |

**SSE 完整流示例**：

```
event: content
data: {"text": "我来帮你分析销售数据。"}

event: content
data: {"text": "首先让我查询一下数据库..."}

event: tool_end
data: {"name": "preview_data", "arguments": "{\"table\": \"sales\"}", "output": "[...]", "content": "数据预览完成"}

event: content
data: {"text": "根据查询结果，销售额呈上升趋势。"}

event: done
data: {"session_id": "550e8400-e29b-41d4-a716-446655440000"}
```

---

## 5. 会话管理接口

### 5.1 获取会话列表

#### `GET /api/sessions`

获取所有会话的摘要列表，按更新时间降序排列。

**请求示例**：

```bash
curl http://localhost:8000/api/sessions
```

**响应**：

```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "帮我查看销售数据的趋势...",
    "updated_at": "2026-03-16 14:30:00.123456",
    "message_count": 6
  },
  {
    "session_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "title": "新对话",
    "updated_at": "2026-03-16 10:00:00.000000",
    "message_count": 0
  }
]
```

**响应字段**：

| 字段            | 类型   | 说明                                       |
| --------------- | ------ | ------------------------------------------ |
| `session_id`    | string | 会话唯一标识（UUID）                        |
| `title`         | string | 会话标题（自动从首条用户消息截取，最多 30 字） |
| `updated_at`    | string | 最后更新时间（`YYYY-MM-DD HH:MM:SS.ffffff`）|
| `message_count` | int    | 消息总数                                    |

| 状态码 | 说明     |
| ------ | -------- |
| 200    | 获取成功 |

---

### 5.2 创建会话

#### `POST /api/sessions`

创建一个新的空会话。

**请求体**：

| 字段    | 类型   | 必填 | 默认值   | 说明       |
| ------- | ------ | ---- | -------- | ---------- |
| `title` | string | ❌   | `新对话` | 会话标题   |

**请求示例**：

```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"title": "销售分析"}'
```

**响应**：

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "销售分析",
  "updated_at": "2026-03-16 14:30:00.123456",
  "message_count": 0
}
```

| 状态码 | 说明     |
| ------ | -------- |
| 200    | 创建成功 |

---

### 5.3 获取会话详情

#### `GET /api/sessions/{session_id}`

获取指定会话的详细信息，包含完整的消息历史。

**路径参数**：

| 参数         | 类型   | 说明       |
| ------------ | ------ | ---------- |
| `session_id` | string | 会话 ID    |

**请求示例**：

```bash
curl http://localhost:8000/api/sessions/550e8400-e29b-41d4-a716-446655440000
```

**响应**：

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "帮我查看销售数据的趋势...",
  "updated_at": "2026-03-16 14:30:00.123456",
  "messages": [
    {
      "role": "system",
      "content": "你是一个数据分析助手..."
    },
    {
      "role": "user",
      "content": "帮我查看销售数据的趋势"
    },
    {
      "role": "assistant",
      "content": "根据数据分析，销售额在第三季度呈现上升趋势..."
    }
  ]
}
```

**messages 数组中的消息对象**：

| 字段      | 类型   | 说明                                          |
| --------- | ------ | --------------------------------------------- |
| `role`    | string | 消息角色：`system` / `user` / `assistant` / `tool` |
| `content` | string | 消息内容                                       |

> 注：`tool` 角色的消息可能包含额外的工具调用相关字段。

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 获取成功     |
| 404    | 会话不存在   |

---

### 5.4 更新会话

#### `PATCH /api/sessions/{session_id}`

更新会话信息（目前支持更新标题）。

**路径参数**：

| 参数         | 类型   | 说明       |
| ------------ | ------ | ---------- |
| `session_id` | string | 会话 ID    |

**请求体**：

| 字段    | 类型   | 必填 | 说明       |
| ------- | ------ | ---- | ---------- |
| `title` | string | ❌   | 新的标题   |

**请求示例**：

```bash
curl -X PATCH http://localhost:8000/api/sessions/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"title": "Q3 销售趋势分析"}'
```

**响应**：

```json
{
  "message": "Session updated"
}
```

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 更新成功     |
| 404    | 会话不存在   |

---

### 5.5 删除会话

#### `DELETE /api/sessions/{session_id}`

删除指定会话及其所有消息历史。

**路径参数**：

| 参数         | 类型   | 说明       |
| ------------ | ------ | ---------- |
| `session_id` | string | 会话 ID    |

**请求示例**：

```bash
curl -X DELETE http://localhost:8000/api/sessions/550e8400-e29b-41d4-a716-446655440000
```

**响应**：

```json
{
  "message": "Session deleted"
}
```

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 删除成功     |
| 404    | 会话不存在   |

---

## 6. 数据模型

### ChatRequest

聊天请求模型。

```json
{
  "session_id": "string (必填)",
  "message": "string (必填)",
  "model": "string (可选, 默认: moonshotai/Kimi-K2-Instruct-0905)"
}
```

### SessionCreate

创建会话请求模型。

```json
{
  "title": "string (可选, 默认: 新对话)"
}
```

### SessionUpdate

更新会话请求模型。

```json
{
  "title": "string (可选)"
}
```

### SessionInfoResponse

会话摘要响应模型。

```json
{
  "session_id": "string",
  "title": "string",
  "updated_at": "string (YYYY-MM-DD HH:MM:SS.ffffff)",
  "message_count": "integer"
}
```

### SessionDetailResponse

会话详情响应模型。

```json
{
  "session_id": "string",
  "title": "string",
  "updated_at": "string (YYYY-MM-DD HH:MM:SS.ffffff)",
  "messages": [
    {
      "role": "string",
      "content": "string"
    }
  ]
}
```

---

## 7. 错误处理

### HTTP 错误响应

当请求出错时，API 返回标准的 HTTP 错误响应：

```json
{
  "detail": "错误描述信息"
}
```

| 状态码 | 说明                           |
| ------ | ------------------------------ |
| 200    | 请求成功                       |
| 404    | 资源不存在（会话未找到）        |
| 422    | 请求参数校验失败（Pydantic）    |
| 500    | 服务器内部错误                  |

### SSE 错误事件

聊天接口 (`POST /api/chat`) 中的异常通过 SSE `error` 事件推送，不会返回 HTTP 错误状态码：

```
event: error
data: {"message": "具体的错误描述"}
```
