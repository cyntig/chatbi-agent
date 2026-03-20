/**
 * Session API
 */

import axios from 'axios'
import type { SessionInfo, SessionDetail } from '@/types/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const sessionAPI = {
  /**
   * Get all sessions
   */
  async getSessions(): Promise<SessionInfo[]> {
    const response = await api.get<{ sessions: SessionInfo[] }>('/api/chatbi/sessions')
    return response.data.sessions
  },

  /**
   * Get session detail
   */
  async getSession(sessionId: string): Promise<SessionDetail> {
    const response = await api.get<SessionDetail>(`/api/chatbi/sessions/${sessionId}`)
    return response.data
  },

  /**
   * Create a new session
   */
  async createSession(title?: string): Promise<SessionInfo> {
    const params = title ? { title } : undefined
    const response = await api.post<SessionInfo>('/api/chatbi/sessions', null, { params })
    return response.data
  },

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/api/chatbi/sessions/${sessionId}`)
  },

  /**
   * Update session title
   */
  async updateSession(sessionId: string, newTitle: string): Promise<void> {
    await api.patch(`/api/chatbi/sessions/${sessionId}`, null, {
      params: { new_title: newTitle },
    })
  },
}

export default sessionAPI
