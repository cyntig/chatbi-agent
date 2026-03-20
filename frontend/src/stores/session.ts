/**
 * Session Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessionAPI } from '@/api/session'
import type { SessionInfo, SessionDetail } from '@/types/api'

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionInfo[]>([])
  const currentSession = ref<SessionDetail | null>(null)
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load all sessions
   */
  async function loadSessions(): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const data = await sessionAPI.getSessions()
      sessions.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to load sessions'
      console.error('Error loading sessions:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Load a specific session
   */
  async function loadSession(sessionId: string): Promise<SessionDetail> {
    isLoading.value = true
    error.value = null

    try {
      const session = await sessionAPI.getSession(sessionId)
      currentSession.value = session
      currentSessionId.value = session.session_id
      return session
    } catch (err: any) {
      error.value = err.message || 'Failed to load session'
      console.error('Error loading session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new session
   */
  async function createSession(title?: string): Promise<SessionInfo> {
    isLoading.value = true
    error.value = null

    try {
      const session = await sessionAPI.createSession(title)
      sessions.value.unshift(session)
      return session
    } catch (err: any) {
      error.value = err.message || 'Failed to create session'
      console.error('Error creating session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a session
   */
  async function deleteSession(sessionId: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await sessionAPI.deleteSession(sessionId)
      sessions.value = sessions.value.filter((s) => s.session_id !== sessionId)

      // If deleted session was current, clear it
      if (currentSessionId.value === sessionId) {
        currentSession.value = null
        currentSessionId.value = null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to delete session'
      console.error('Error deleting session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update session title
   */
  async function updateSession(sessionId: string, newTitle: string): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      await sessionAPI.updateSession(sessionId, newTitle)

      // Update in sessions list
      const session = sessions.value.find((s) => s.session_id === sessionId)
      if (session) {
        session.title = newTitle
      }

      // Update current session if needed
      if (currentSession.value?.session_id === sessionId) {
        currentSession.value.title = newTitle
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update session'
      console.error('Error updating session:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Set current session (without loading from API)
   */
  function setCurrentSession(sessionId: string | null): void {
    currentSessionId.value = sessionId
    if (sessionId) {
      const session = sessions.value.find((s) => s.session_id === sessionId)
      if (session) {
        currentSession.value = {
          ...session,
          messages: [],
        }
      }
    } else {
      currentSession.value = null
    }
  }

  return {
    sessions,
    currentSession,
    currentSessionId,
    isLoading,
    error,
    loadSessions,
    loadSession,
    createSession,
    deleteSession,
    updateSession,
    setCurrentSession,
  }
})
