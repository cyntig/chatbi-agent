// MCP (Model Context Protocol) related type definitions

export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, any>
}

export interface MCPToolRequest {
  name: string
  arguments: Record<string, any>
}

export interface MCPToolResponse {
  content: any
  isError?: boolean
  metadata?: {
    executionTime?: number
    tokensUsed?: number
  }
}

export interface MCPServerInfo {
  name: string
  version: string
  tools: MCPTool[]
}

export interface DataPreviewRequest {
  tbl_schema: string
  tbl_name: string
  limit?: number
}

export interface GenerateSQLRequest {
  tbl_schema: string
  tbl_name: string
  question: string
}

export interface ExecuteSQLRequest {
  sql: string
  params?: any[]
}
