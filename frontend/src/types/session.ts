// Session related type definitions

export interface Session {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  lastMessage: string
  metadata: {
    schema?: string
    table?: string
    tags?: string[]
  }
}

export interface SessionCreateRequest {
  title?: string
  schema?: string
  table?: string
}

export interface SessionUpdateRequest {
  title?: string
  tags?: string[]
}

export interface SessionListResponse {
  sessions: Session[]
  total: number
  page: number
  pageSize: number
}

export interface SessionSearchFilters {
  query?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
}
