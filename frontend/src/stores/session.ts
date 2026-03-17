/**
 * Session Store - 管理会话列表
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@/types'
import {
  fetchSessions,
  createSession as apiCreateSession,
  deleteSession as apiDeleteSession,
  renameSession as apiRenameSession,
} from '@/services/api'

export const useSessionStore = defineStore('session', () => {
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string | null>(null)
  const loading = ref(false)

  const currentSession = computed(() =>
    sessions.value.find((s) => s.sessionId === currentSessionId.value) || null
  )

  async function loadSessions() {
    loading.value = true
    try {
      sessions.value = await fetchSessions()
    } catch (e) {
      console.error('Failed to load sessions:', e)
    } finally {
      loading.value = false
    }
  }

  async function createNewSession(): Promise<string> {
    const session = await apiCreateSession()
    sessions.value.unshift(session)
    currentSessionId.value = session.sessionId
    return session.sessionId
  }

  async function removeSession(sessionId: string) {
    await apiDeleteSession(sessionId)
    sessions.value = sessions.value.filter((s) => s.sessionId !== sessionId)
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = sessions.value.length > 0 ? sessions.value[0].sessionId : null
    }
  }

  async function rename(sessionId: string, title: string) {
    await apiRenameSession(sessionId, title)
    const session = sessions.value.find((s) => s.sessionId === sessionId)
    if (session) session.title = title
  }

  function selectSession(sessionId: string) {
    currentSessionId.value = sessionId
  }

  return {
    sessions,
    currentSessionId,
    currentSession,
    loading,
    loadSessions,
    createNewSession,
    removeSession,
    rename,
    selectSession,
  }
})
