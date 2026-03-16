// Session state management

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, SessionCreateRequest } from '@/types'

// Simple UUID generator
function generateId(): string {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
import { storage } from '@/utils/storage'

export const useSessionStore = defineStore('session', () => {
  // State
  const sessions = ref<Session[]>([])
  const currentSessionId = ref<string>('')
  const isLoading = ref(false)

  // Computed
  const currentSession = computed(() => {
    return sessions.value.find((s) => s.id === currentSessionId.value) || null
  })

  const sortedSessions = computed(() => {
    return [...sessions.value].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  })

  const sessionCount = computed(() => {
    return sessions.value.length
  })

  // Actions
  function loadSessions() {
    const cached = storage.get<Session[]>('sessions')
    if (cached) {
      sessions.value = cached
    }

    // Load current session
    const currentId = storage.get<string>('current_session')
    if (currentId) {
      currentSessionId.value = currentId
    }
  }

  function saveSessions() {
    storage.set('sessions', sessions.value)
  }

  function createSession(data?: SessionCreateRequest): Session {
    const newSession: Session = {
      id: generateId(),
      title: data?.title || 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      lastMessage: '',
      metadata: {
        schema: data?.schema,
        table: data?.table,
        tags: [],
      },
    }

    sessions.value.unshift(newSession)
    saveSessions()
    return newSession
  }

  function updateSession(sessionId: string, updates: Partial<Session>) {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions.value[index] = {
        ...sessions.value[index],
        ...updates,
        updatedAt: new Date(),
      }
      saveSessions()
    }
  }

  function deleteSession(sessionId: string) {
    const index = sessions.value.findIndex((s) => s.id === sessionId)
    if (index !== -1) {
      sessions.value.splice(index, 1)
      saveSessions()

      // If deleted session was current, switch to another
      if (currentSessionId.value === sessionId) {
        currentSessionId.value = sessions.value[0]?.id || ''
      }
    }
  }

  function switchSession(sessionId: string) {
    currentSessionId.value = sessionId
    storage.set('current_session', sessionId)
  }

  function incrementMessageCount(sessionId: string) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.messageCount++
      session.updatedAt = new Date()
      saveSessions()
    }
  }

  function updateLastMessage(sessionId: string, message: string) {
    const session = sessions.value.find((s) => s.id === sessionId)
    if (session) {
      session.lastMessage = message.substring(0, 100) // Truncate long messages
      session.updatedAt = new Date()
      saveSessions()
    }
  }

  function searchSessions(query: string): Session[] {
    const lowerQuery = query.toLowerCase()
    return sessions.value.filter((session) => {
      return (
        session.title.toLowerCase().includes(lowerQuery) ||
        session.lastMessage.toLowerCase().includes(lowerQuery)
      )
    })
  }

  function clearSessions() {
    sessions.value = []
    currentSessionId.value = ''
    storage.remove('sessions')
    storage.remove('current_session')
  }

  // Initialize
  loadSessions()

  return {
    // State
    sessions,
    currentSessionId,
    isLoading,

    // Computed
    currentSession,
    sortedSessions,
    sessionCount,

    // Actions
    loadSessions,
    saveSessions,
    createSession,
    updateSession,
    deleteSession,
    switchSession,
    incrementMessageCount,
    updateLastMessage,
    searchSessions,
    clearSessions,
  }
})
