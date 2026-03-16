// Chat related type definitions

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  sessionId: string
  metadata?: {
    tools?: ToolCall[]
    charts?: ChartData[]
    tables?: TableData[]
  }
}

export interface ToolCall {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  arguments: Record<string, any>
  result?: any
  error?: string
  startTime?: Date
  endTime?: Date
}

export interface ChartData {
  id: string
  type: 'line' | 'bar' | 'pie' | 'scatter'
  title: string
  data: any
  options?: any
}

export interface TableData {
  id: string
  title: string
  columns: string[]
  rows: any[]
  metadata?: {
    totalRows?: number
    schema?: string
    table?: string
  }
}

export interface StreamEvent {
  type: 'content' | 'tool' | 'chart' | 'table' | 'error' | 'done'
  data: any
  timestamp: Date
}

export interface ChatRequest {
  message: string
  sessionId: string
  schema?: string
  table?: string
}
