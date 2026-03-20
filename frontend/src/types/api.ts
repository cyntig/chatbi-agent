/**
 * API Type Definitions
 */

export interface SessionInfo {
  session_id: string
  title: string
  updated_at: string
  message_count: number
}

export interface SessionDetail extends SessionInfo {
  messages: Message[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  name: string
  arguments: string
  output: string
  content?: string
}

export interface Event {
  type: 'text' | 'tool' | 'error' | 'end'
  content?: string
  tool_call?: ToolCall
  error?: string
}

export interface CreateSessionResponse {
  session_id: string
  title: string
  created_at: string
}

export interface ErrorResponse {
  error: string
  detail?: string
}
