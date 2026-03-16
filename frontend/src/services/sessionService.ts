// Session management service

import { requestClient } from './api'
import type { Session, SessionCreateRequest, SessionUpdateRequest, SessionListResponse } from '@/types'
import { API_ENDPOINTS } from '@/utils/constants'

export class SessionService {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    const response = await requestClient.get<Session[]>(API_ENDPOINTS.sessions.list)
    return response.data || []
  }

  /**
   * Get paginated sessions
   */
  async getSessionsPaginated(page: number = 1, pageSize: number = 20): Promise<SessionListResponse> {
    const response = await requestClient.get<SessionListResponse>(
      `${API_ENDPOINTS.sessions.list}?page=${page}&page_size=${pageSize}`
    )
    return response.data || { sessions: [], total: 0, page, pageSize }
  }

  /**
   * Get a specific session
   */
  async getSession(sessionId: string): Promise<Session | null> {
    const response = await requestClient.get<Session>(API_ENDPOINTS.sessions.get(sessionId))
    return response.data || null
  }

  /**
   * Create a new session
   */
  async createSession(request: SessionCreateRequest): Promise<Session> {
    const response = await requestClient.post<Session>(API_ENDPOINTS.sessions.create, request)
    return response.data!
  }

  /**
   * Update a session
   */
  async updateSession(sessionId: string, request: SessionUpdateRequest): Promise<Session> {
    const response = await requestClient.put<Session>(API_ENDPOINTS.sessions.update(sessionId), request)
    return response.data!
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await requestClient.delete(API_ENDPOINTS.sessions.delete(sessionId))
  }

  /**
   * Search sessions
   */
  async searchSessions(query: string): Promise<Session[]> {
    const response = await requestClient.get<Session[]>(
      `${API_ENDPOINTS.sessions.list}?q=${encodeURIComponent(query)}`
    )
    return response.data || []
  }
}

export const sessionService = new SessionService()
