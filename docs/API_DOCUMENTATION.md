# ChatBI API 接口文档

## 目录
- [概述](#概述)
- [聊天接口](#聊天接口)
- [会话管理接口](#会话管理接口)
- [数据模型](#数据模型)
- [错误处理](#错误处理)

---

## 概述

ChatBI API 提供了智能对话和会话管理功能，支持流式响应和实时交互。所有接口基于 RESTful 架构设计，使用 SSE (Server-Sent Events) 实现实时流式数据传输。

**基础 URL**: `http://localhost:8000`

**主要功能**:
- 智能对话交互
- 会话创建与管理
- 消息历史记录查询
- 流式响应支持

---

## 聊天接口

### 发送消息 (流式响应)

**接口地址**: `GET /api/chatbi/chat`

**请求方式**: GET

**功能描述**: 向 AI 助手发送消息，通过 SSE 流式返回响应内容

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 | 示例值 |
|--------|------|------|------|--------|
| session_id | string | 是 | 会话 ID，用于标识对话上下文 | "550e8400-e29b-41d4-a716-446655440000" |
| message | string | 是 | 用户消息内容 | "帮我分析一下最近的销售数据" |

**响应格式**: `text/event-stream`

**事件类型**:

| 事件类型 | 描述 | 数据结构 |
|----------|------|----------|
| text | 文本片段，AI 助手的回复内容 | `{"type": "text", "content": "string"}` |
| tool | 工具调用结果，展示 AI 使用的工具及返回 | `{"type": "tool", "tool_call": {...}}` |
| error | 错误信息 | `{"type": "error", "content": "string"}` |

**text 事件示例**:
```json
{
  "type": "text",
  "content": "根据您的要求，我分析了最近30天的销售数据..."
}
```

**tool 事件示例**:
```json
{
  "type": "tool",
  "tool_call": {
    "name": "data_preview_tool",
    "arguments": "{\"table\":\"sales\",\"limit\":10}",
    "output": "查询结果：...",
    "content": null
  }
}
```

**error 事件示例**:
```json
{
  "type": "error",
  "content": "数据库连接失败，请检查配置"
}
```

**请求示例**:
```bash
curl -N "http://localhost:8000/api/chatbi/chat?session_id=550e8400-e29b-41d4-a716-446655440000&message=帮我分析销售数据"
```

**JavaScript 示例**:
```javascript
const eventSource = new EventSource(
  'http://localhost:8000/api/chatbi/chat?session_id=xxx&message=你好'
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'text') {
    console.log('AI回复:', data.content);
  } else if (data.type === 'tool') {
    console.log('工具调用:', data.tool_call);
  } else if (data.type === 'error') {
    console.error('错误:', data.content);
  }
};
```

**响应头**:
```
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
Content-Type: text/event-stream
```

---

## 会话管理接口

### 1. 获取会话列表

**接口地址**: `GET /api/chatbi/sessions`

**请求方式**: GET

**功能描述**: 获取所有会话的概要信息列表

**响应数据结构**:
```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "销售数据分析",
    "updated_at": "2026-03-19T14:30:00Z",
    "message_count": 15
  }
]
```

**字段说明**:

| 字段名 | 类型 | 描述 |
|--------|------|------|
| session_id | string | 会话唯一标识符 |
| title | string | 会话标题 |
| updated_at | string | 最后更新时间 (ISO 8601 格式) |
| message_count | integer | 会话中的消息数量 |

**请求示例**:
```bash
curl -X GET "http://localhost:8000/api/chatbi/sessions"
```

**响应示例**:
```json
[
  {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "销售数据分析",
    "updated_at": "2026-03-19T14:30:00Z",
    "message_count": 15
  },
  {
    "session_id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "用户行为分析",
    "updated_at": "2026-03-19T15:20:00Z",
    "message_count": 8
  }
]
```

---

### 2. 获取会话详情

**接口地址**: `GET /api/chatbi/sessions/{session_id}`

**请求方式**: GET

**功能描述**: 获取指定会话的完整信息，包括所有消息历史

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| session_id | string | 是 | 会话 ID |

**响应数据结构**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "销售数据分析",
  "updated_at": "2026-03-19T14:30:00Z",
  "messages": [
    {
      "role": "user",
      "content": "帮我分析销售数据",
      "timestamp": "2026-03-19T14:00:00Z"
    },
    {
      "role": "assistant",
      "content": "根据数据分析...",
      "timestamp": "2026-03-19T14:00:05Z"
    }
  ]
}
```

**字段说明**:

| 字段名 | 类型 | 描述 |
|--------|------|------|
| session_id | string | 会话唯一标识符 |
| title | string | 会话标题 |
| updated_at | string | 最后更新时间 (ISO 8601 格式) |
| messages | array | 消息历史列表 |
| messages[].role | string | 消息角色 (user/assistant) |
| messages[].content | string | 消息内容 |
| messages[].timestamp | string | 消息时间戳 |

**请求示例**:
```bash
curl -X GET "http://localhost:8000/api/chatbi/sessions/550e8400-e29b-41d4-a716-446655440000"
```

---

### 3. 创建新会话

**接口地址**: `POST /api/chatbi/sessions`

**请求方式**: POST

**功能描述**: 创建一个新的对话会话

**请求参数** (Query/String Body):

| 参数名 | 类型 | 必填 | 默认值 | 描述 |
|--------|------|------|--------|------|
| title | string | 否 | "新对话" | 会话标题 |

**响应数据结构**:
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "销售数据分析",
  "updated_at": "2026-03-19T14:30:00Z",
  "message_count": 0
}
```

**请求示例**:
```bash
# 使用默认标题
curl -X POST "http://localhost:8000/api/chatbi/sessions"

# 自定义标题
curl -X POST "http://localhost:8000/api/chatbi/sessions?title=销售数据分析"
```

---

### 4. 更新会话标题

**接口地址**: `PATCH /api/chatbi/sessions/{session_id}`

**请求方式**: PATCH

**功能描述**: 修改指定会话的标题

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| session_id | string | 是 | 会话 ID |

**请求参数** (Query/String Body):

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| new_title | string | 是 | 新的会话标题 |

**响应数据结构**:
```json
{
  "message": "更新成功"
}
```

**错误响应**:
- `404 Not Found`: 会话不存在

**请求示例**:
```bash
curl -X PATCH "http://localhost:8000/api/chatbi/sessions/550e8400-e29b-41d4-a716-446655440000?new_title=新的标题"
```

---

### 5. 删除会话

**接口地址**: `DELETE /api/chatbi/sessions/{session_id}`

**请求方式**: DELETE

**功能描述**: 删除指定的会话及其所有消息历史

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| session_id | string | 是 | 会话 ID |

**响应数据结构**:
```json
{
  "message": "删除成功"
}
```

**错误响应**:
- `404 Not Found`: 会话不存在

**请求示例**:
```bash
curl -X DELETE "http://localhost:8000/api/chatbi/sessions/550e8400-e29b-41d4-a716-446655440000"
```

---

## 数据模型

### SessionInfoResponse
会话概要信息模型

| 字段名 | 类型 | 描述 |
|--------|------|------|
| session_id | string | 会话唯一标识符 (UUID 格式) |
| title | string | 会话标题 |
| updated_at | string | 最后更新时间 (ISO 8601 格式) |
| message_count | integer | 会话中的消息总数 |

### SessionDetialResponse
会话详细信息模型

| 字段名 | 类型 | 描述 |
|--------|------|------|
| session_id | string | 会话唯一标识符 |
| title | string | 会话标题 |
| updated_at | string | 最后更新时间 |
| messages | array[dict] | 消息历史记录 |

### Event
流式事件模型

| 字段名 | 类型 | 描述 |
|--------|------|------|
| type | string | 事件类型：'text', 'tool', 'error' |
| content | string \| null | 事件内容 (text/error 类型) |
| tool_call | ToolCallEvent \| null | 工具调用信息 (tool 类型) |

### ToolCallEvent
工具调用事件模型

| 字段名 | 类型 | 描述 |
|--------|------|------|
| name | string | 工具名称 |
| arguments | string | 工具调用参数 (JSON 字符串) |
| output | string | 工具执行结果 |
| content | string \| null | 额外内容 |

---

## 错误处理

所有错误响应都遵循统一的格式：

### 标准错误响应格式
```json
{
  "detail": "错误描述信息"
}
```

### 常见错误码

| HTTP 状态码 | 描述 | 示例场景 |
|------------|------|----------|
| 400 | 请求参数错误 | 缺少必填参数、参数格式错误 |
| 404 | 资源不存在 | 会话 ID 不存在 |
| 500 | 服务器内部错误 | 数据库连接失败、服务异常 |

### 错误示例

**404 错误** (会话不存在):
```json
{
  "detail": "会话不存在"
}
```

**500 错误** (服务器异常):
```json
{
  "detail": "数据库连接失败，请检查配置"
}
```

---

## 使用建议

### 1. 会话管理最佳实践
- 为每个不同的对话主题创建独立的会话
- 定期更新会话标题以方便识别
- 及时清理不需要的会话

### 2. 流式响应处理
- 客户端需要实现 SSE 连接管理
- 处理连接中断后的重连逻辑
- 区分不同事件类型进行相应处理

### 3. 性能优化
- 会话列表建议实现分页加载
- 长时间对话建议定期清理历史消息
- 缓存会话信息减少重复请求

---

## 附录

### 技术栈
- **Web 框架**: FastAPI
- **数据验证**: Pydantic
- **流式传输**: Server-Sent Events (SSE)
- **异步处理**: asyncio

### 版本信息
- **API 版本**: v1.0
- **文档更新日期**: 2026-03-19

### 联系方式
如有问题或建议，请联系开发团队。
