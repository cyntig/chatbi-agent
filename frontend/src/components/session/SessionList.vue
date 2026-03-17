<template>
  <div class="session-list">
    <SessionItem
      v-for="session in sessionStore.sessions"
      :key="session.sessionId"
      :session="session"
      :active="session.sessionId === sessionStore.currentSessionId"
      @select="handleSelect(session.sessionId)"
      @delete="handleDelete(session.sessionId)"
      @rename="handleRename(session.sessionId, $event)"
    />
    <div v-if="sessionStore.sessions.length === 0 && !sessionStore.loading" class="empty">
      暂无对话
    </div>
  </div>
</template>

<script setup lang="ts">
import SessionItem from './SessionItem.vue'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const sessionStore = useSessionStore()
const chatStore = useChatStore()
const router = useRouter()

function handleSelect(sessionId: string) {
  if (sessionId === sessionStore.currentSessionId) return
  sessionStore.selectSession(sessionId)
  router.push(`/chat/${sessionId}`)
}

async function handleDelete(sessionId: string) {
  await sessionStore.removeSession(sessionId)
  if (sessionStore.currentSessionId) {
    chatStore.loadSession(sessionStore.currentSessionId)
    router.push(`/chat/${sessionStore.currentSessionId}`)
  } else {
    chatStore.clearMessages()
    router.push('/')
  }
}

async function handleRename(sessionId: string, title: string) {
  await sessionStore.rename(sessionId, title)
}
</script>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
</style>
