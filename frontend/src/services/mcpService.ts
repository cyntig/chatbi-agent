// MCP service client for direct MCP server communication

import { requestClient } from './api'
import type { MCPToolRequest, MCPToolResponse, DataPreviewRequest, GenerateSQLRequest } from '@/types'
import { API_ENDPOINTS } from '@/utils/constants'

export class MCPService {
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_MCP_BASE_URL || 'http://localhost:8000'
  }

  /**
   * Get available MCP tools
   */
  async getTools(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/mcp/tools`)
    const data = await response.json()
    return data.tools || []
  }

  /**
   * Call an MCP tool
   */
  async callTool(request: MCPToolRequest): Promise<MCPToolResponse> {
    const response = await fetch(`${this.baseUrl}/mcp/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()
    return data
  }

  /**
   * Preview table data
   */
  async dataPreview(request: DataPreviewRequest): Promise<any> {
    return await this.callTool({
      name: 'data_preview',
      arguments: {
        tbl_schema: request.tbl_schema,
        tbl_name: request.tbl_name,
        limit: request.limit || 100,
      },
    })
  }

  /**
   * Generate and execute SQL
   */
  async generateAndExecuteSQL(request: GenerateSQLRequest): Promise<any> {
    return await this.callTool({
      name: 'generate_and_execute_sql',
      arguments: {
        tbl_schema: request.tbl_schema,
        tbl_name: request.tbl_name,
        question: request.question,
      },
    })
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/mcp/server_info`)
    return await response.json()
  }
}

export const mcpService = new MCPService()
