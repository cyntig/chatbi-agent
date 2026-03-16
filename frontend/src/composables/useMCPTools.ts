// MCP tools composable

import { ref, readonly } from 'vue'
import { mcpService } from '@/services/mcpService'
import type { MCPTool, DataPreviewRequest, GenerateSQLRequest } from '@/types'

export function useMCPTools() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const tools = ref<MCPTool[]>([])

  /**
   * Load available MCP tools
   */
  async function loadTools() {
    isLoading.value = true
    error.value = null

    try {
      const loadedTools = await mcpService.getTools()
      tools.value = loadedTools
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tools'
      console.error('Error loading MCP tools:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get table data preview
   */
  async function getDataPreview(request: DataPreviewRequest) {
    isLoading.value = true
    error.value = null

    try {
      const result = await mcpService.dataPreview(request)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to get data preview'
      console.error('Error getting data preview:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generate and execute SQL
   */
  async function generateSQL(request: GenerateSQLRequest) {
    isLoading.value = true
    error.value = null

    try {
      const result = await mcpService.generateAndExecuteSQL(request)
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate SQL'
      console.error('Error generating SQL:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Call a generic MCP tool
   */
  async function callTool(name: string, arguments_: Record<string, any>) {
    isLoading.value = true
    error.value = null

    try {
      const result = await mcpService.callTool({
        name,
        arguments: arguments_,
      })
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Tool call failed'
      console.error('Error calling tool:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get MCP server information
   */
  async function getServerInfo() {
    try {
      return await mcpService.getServerInfo()
    } catch (err) {
      console.error('Error getting server info:', err)
      return null
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),
    tools: readonly(tools),

    // Actions
    loadTools,
    getDataPreview,
    generateSQL,
    callTool,
    getServerInfo,
  }
}
