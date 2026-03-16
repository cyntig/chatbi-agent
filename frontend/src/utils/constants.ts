// Application constants

export const APP_CONFIG = {
  title: 'ChatBI Agent',
  version: '0.1.0',
  description: 'AI-Powered Data Analytics',
} as const

export const API_ENDPOINTS = {
  chat: {
    stream: '/api/chat/stream',
    websocket: '/api/chat/ws',
    history: '/api/chat/history',
  },
  sessions: {
    list: '/api/sessions',
    create: '/api/sessions',
    get: (id: string) => `/api/sessions/${id}`,
    update: (id: string) => `/api/sessions/${id}`,
    delete: (id: string) => `/api/sessions/${id}`,
  },
  mcp: {
    tools: '/mcp/tools',
    call: '/mcp/tools/call',
  },
  export: {
    excel: '/api/export/excel',
    pdf: '/api/export/pdf',
    png: '/api/export/png',
    markdown: '/api/export/markdown',
    json: '/api/export/json',
  },
} as const

export const STORAGE_KEYS = {
  currentSession: 'current_session',
  userPreferences: 'user_preferences',
  sessionCache: 'session_cache',
  authCookie: 'auth_cookie',
} as const

export const CHAT_CONFIG = {
  maxMessageLength: 10000,
  streamTimeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const

export const SESSION_CONFIG = {
  maxSessions: 100,
  defaultTitle: 'New Chat',
  autoSaveInterval: 5000,
} as const

export const EXPORT_CONFIG = {
  maxRows: 10000,
  defaultFilename: 'chatbi-export',
  formats: ['excel', 'pdf', 'png', 'markdown', 'json'] as const,
} as const

export const CHART_TYPES = {
  line: 'line',
  bar: 'bar',
  pie: 'pie',
  scatter: 'scatter',
  area: 'area',
} as const

export const THEME_COLORS = {
  primary: '#0ea5e9',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#6366f1',
} as const

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export const MESSAGE_TYPES = {
  text: 'text',
  tool: 'tool',
  chart: 'chart',
  table: 'table',
  error: 'error',
} as const

export const TOOL_STATUS = {
  pending: 'pending',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
} as const
