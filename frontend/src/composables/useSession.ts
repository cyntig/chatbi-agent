// Session management composable

import { ref, computed, readonly } from 'vue'
import { useSessionStore } from '@/stores/session'
import { sessionService } from '@/services/sessionService'
import type { Session, SessionCreateRequest } from '@/types'

export function useSession() {
  const sessionStore = useSessionStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Load sessions from server
   */
  async function loadSessions() {
    isLoading.value = true
    error.value = null

    try {
      const sessions = await sessionService.getSessions()
      sessionStore.sessions = sessions
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sessions'
      console.error('Error loading sessions:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new session
   */
  async function createSession(request?: SessionCreateRequest) {
    isLoading.value = true
    error.value = null

    try {
      const session = await sessionService.createSession(request || {})
      sessionStore.createSession(request)
      sessionStore.switchSession(session.id)
      return session
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create session'
      console.error('Error creating session:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Switch to a different session
   */
  function switchSession(sessionId: string) {
    sessionStore.switchSession(sessionId)
  }

  /**
   * Delete a session
   */
  async function deleteSession(sessionId: string) {
    isLoading.value = true
    error.value = null

    try {
      await sessionService.deleteSession(sessionId)
      sessionStore.deleteSession(sessionId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete session'
      console.error('Error deleting session:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update session metadata
   */
  async function updateSession(sessionId: string, updates: Partial<Session>) {
    isLoading.value = true
    error.value = null

    try {
      await sessionService.updateSession(sessionId, updates)
      sessionStore.updateSession(sessionId, updates)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update session'
      console.error('Error updating session:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Search sessions
   */
  function searchSessions(query: string) {
    return sessionStore.searchSessions(query)
  }

  /**
   * Clear all sessions
   */
  function clearSessions() {
    sessionStore.clearSessions()
  }

  return {
    // State
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Actions
    loadSessions,
    createSession,
    switchSession,
    deleteSession,
    updateSession,
    searchSessions,
    clearSessions,

    // Store access
    sessions: computed(() => sessionStore.sortedSessions),
    currentSession: computed(() => sessionStore.currentSession),
    currentSessionId: computed(() => sessionStore.currentSessionId),
    sessionCount: computed(() => sessionStore.sessionCount),
  }
}
