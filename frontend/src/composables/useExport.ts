// Export functionality composable

import { ref, readonly } from 'vue'
import { exportService } from '@/services/exportService'
import type { ExportRequest } from '@/types'

export function useExport() {
  const isExporting = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  /**
   * Export data to Excel
   */
  async function exportToExcel(data: any[], filename?: string) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      await exportService.exportToExcelClient(data, filename)
      success.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting to Excel:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export chart to PNG
   */
  async function exportChartToPNG(elementId: string, filename?: string) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      const result = await exportService.exportToPNG(elementId, filename)
      success.value = result.success
      if (!result.success) {
        error.value = result.error || 'Export failed'
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting chart to PNG:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export conversation to PDF
   */
  async function exportToPDF(content: string, filename?: string) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      const result = await exportService.exportToPDF(content, filename)
      success.value = result.success
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting to PDF:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export conversation to Markdown
   */
  async function exportToMarkdown(messages: any[], filename?: string) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      const result = await exportService.exportToMarkdown(messages, filename)
      success.value = result.success
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting to Markdown:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Export data to JSON
   */
  async function exportToJSON(data: any, filename?: string) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      const result = await exportService.exportToJSON(data, filename)
      success.value = result.success
      if (result.success && result.url) {
        window.open(result.url, '_blank')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting to JSON:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Generic export function
   */
  async function exportData(request: ExportRequest) {
    isExporting.value = true
    error.value = null
    success.value = false

    try {
      switch (request.format) {
        case 'excel':
          await exportToExcel(request.data, request.filename)
          break
        case 'pdf':
          await exportToPDF(request.data, request.filename)
          break
        case 'png':
          await exportChartToPNG(request.data, request.filename)
          break
        case 'markdown':
          await exportToMarkdown(request.data, request.filename)
          break
        case 'json':
          await exportToJSON(request.data, request.filename)
          break
        default:
          throw new Error(`Unsupported export format: ${request.format}`)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Export failed'
      console.error('Error exporting data:', err)
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Reset export state
   */
  function reset() {
    isExporting.value = false
    error.value = null
    success.value = false
  }

  return {
    // State
    isExporting: readonly(isExporting),
    error: readonly(error),
    success: readonly(success),

    // Actions
    exportToExcel,
    exportChartToPNG,
    exportToPDF,
    exportToMarkdown,
    exportToJSON,
    exportData,
    reset,
  }
}
