/**
 * TypeScript 类型定义
 */

// 工具调用
export interface ToolCall {
  name: string
  arguments: Record<string, any> | string
  output: any
  content?: string
  isExpanded: boolean
}

// 消息内容片段（按流式顺序排列）
export type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'tool'; toolCall: ToolCall }

// 聊天消息
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: MessagePart[]
  isStreaming: boolean
  timestamp: number
}

// 会话信息
export interface Session {
  sessionId: string
  title: string
  updatedAt: string
  messageCount: number
}

// 会话详情
export interface SessionDetail {
  sessionId: string
  title: string
  updatedAt: string
  messages: RawMessage[]
}

// 原始消息格式（与后端 OpenAI 格式对应）
export interface RawMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: RawToolCall[]
  tool_call_id?: string
  name?: string
}

export interface RawToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// SSE 事件载荷
export interface SSEContentEvent {
  text: string
}

export interface SSEToolEndEvent {
  name: string
  arguments: any
  output: any
  content?: string
}

export interface SSEDoneEvent {
  session_id: string
}

export interface SSEErrorEvent {
  message: string
}
