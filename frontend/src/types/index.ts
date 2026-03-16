// Unified type exports

export * from './chat'
export * from './mcp'
export * from './session'

// Common types
export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface ExportRequest {
  format: 'excel' | 'pdf' | 'png' | 'markdown' | 'json'
  data: any
  filename?: string
}

export interface ExportResponse {
  success: boolean
  url?: string
  error?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: boolean
}

export interface ChartOptions {
  responsive?: boolean
  animation?: boolean
  legend?: boolean
  tooltip?: boolean
  [key: string]: any
}

// DataTable column type
export interface Column {
  title: string
  key: string
  width?: number
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean | {
    tooltip: boolean
  }
  fixed?: 'left' | 'right'
  render?: (row: any) => any
  sorter?: boolean | ((row1: any, row2: any) => number)
  filter?: boolean | ((options: {
    value: any
    row: any
  }) => boolean)
  filterOptionValues?: any[]
}
