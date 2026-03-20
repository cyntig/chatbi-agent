/**
 * Session Type Definitions
 */

import type { SessionInfo } from './api'

export interface SessionState {
  sessions: SessionInfo[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
}

export interface CreateSessionParams {
  title?: string
}

export interface UpdateSessionParams {
  sessionId: string
  newTitle: string
}
