// Export service for data export functionality

import { requestClient } from '@/services/api'
import type { ExportRequest, ExportResponse } from '@/types'
import { API_ENDPOINTS, EXPORT_CONFIG } from '@/utils/constants'

export class ExportService {
  /**
   * Export data to Excel
   */
  async exportToExcel(data: any[], filename?: string): Promise<ExportResponse> {
    const response = await requestClient.post<{ url: string }>(API_ENDPOINTS.export.excel, {
      data,
      filename: filename || `${EXPORT_CONFIG.defaultFilename}.xlsx`,
    })
    return { success: true, url: response.data?.url }
  }

  /**
   * Export data to PDF
   */
  async exportToPDF(content: string, filename?: string): Promise<ExportResponse> {
    const response = await requestClient.post<{ url: string }>(API_ENDPOINTS.export.pdf, {
      content,
      filename: filename || `${EXPORT_CONFIG.defaultFilename}.pdf`,
    })
    return { success: true, url: response.data?.url }
  }

  /**
   * Export chart to PNG
   */
  async exportToPNG(elementId: string, filename?: string): Promise<ExportResponse> {
    const element = document.getElementById(elementId)
    if (!element) {
      return { success: false, error: 'Element not found' }
    }

    try {
      // Use html2canvas for client-side export
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(element)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = filename || `${EXPORT_CONFIG.defaultFilename}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Export to Markdown
   */
  async exportToMarkdown(messages: any[], filename?: string): Promise<ExportResponse> {
    const content = this.convertToMarkdown(messages)
    const response = await requestClient.post<{ url: string }>(API_ENDPOINTS.export.markdown, {
      content,
      filename: filename || `${EXPORT_CONFIG.defaultFilename}.md`,
    })
    return { success: true, url: response.data?.url }
  }

  /**
   * Export to JSON
   */
  async exportToJSON(data: any, filename?: string): Promise<ExportResponse> {
    const content = JSON.stringify(data, null, 2)
    const response = await requestClient.post<{ url: string }>(API_ENDPOINTS.export.json, {
      content,
      filename: filename || `${EXPORT_CONFIG.defaultFilename}.json`,
    })
    return { success: true, url: response.data?.url }
  }

  /**
   * Client-side Excel export using xlsx library
   */
  async exportToExcelClient(data: any[], filename?: string): Promise<void> {
    const XLSX = await import('xlsx')
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Data')
    XLSX.writeFile(wb, filename || `${EXPORT_CONFIG.defaultFilename}.xlsx`)
  }

  /**
   * Convert messages to Markdown format
   */
  private convertToMarkdown(messages: any[]): string {
    let markdown = `# ChatBI Agent Export\n\n`
    markdown += `Generated: ${new Date().toISOString()}\n\n`

    messages.forEach((msg, index) => {
      markdown += `## ${msg.role === 'user' ? 'User' : 'Assistant'}\n\n`
      markdown += `${msg.content}\n\n`

      if (msg.metadata?.tools) {
        markdown += `**Tools called:**\n`
        msg.metadata.tools.forEach((tool: any) => {
          markdown += `- \`${tool.name}\`\n`
        })
        markdown += `\n`
      }

      if (msg.metadata?.charts) {
        markdown += `**Charts:** ${msg.metadata.charts.length} chart(s) generated\n\n`
      }

      if (msg.metadata?.tables) {
        markdown += `**Tables:** ${msg.metadata.tables.length} table(s) generated\n\n`
      }
    })

    return markdown
  }
}

export const exportService = new ExportService()
