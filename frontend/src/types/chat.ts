/**
 * Chat Type Definitions
 */

import type { Message, ToolCall, Event } from './api'

export interface ChatMessage extends Message {
  id: string
  isStreaming?: boolean
  pending?: boolean
  events?: MessageEvent[] // 按SSE返回顺序存储的所有事件
}

export interface MessageEvent {
  type: 'text' | 'tool'
  content?: string
  toolCall?: ToolCall
}

export interface ChatState {
  messages: ChatMessage[]
  isStreaming: boolean
  currentSessionId: string | null
}

export interface SendMessageParams {
  sessionId: string
  content: string
}

export interface StreamingEvent {
  type: 'text' | 'tool' | 'error' | 'end'
  content?: string
  toolCall?: ToolCall
  error?: string
}
