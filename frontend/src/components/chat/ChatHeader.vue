<template>
  <header class="chat-header" role="banner">
    <h2 class="chat-title">{{ sessionTitle }}</h2>
    <div class="chat-actions">
      <button
        class="action-btn"
        @click="handleRename"
        aria-label="重命名会话"
      >
        <EditIcon />
      </button>
      <button
        class="action-btn action-btn--danger"
        @click="handleDelete"
        aria-label="删除会话"
      >
        <TrashIcon />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const sessionTitle = computed(() => {
  return sessionStore.currentSession?.title || '新对话'
})

function handleRename() {
  const newTitle = prompt('输入新标题:', sessionTitle.value)
  if (newTitle && newTitle !== sessionTitle.value) {
    const sessionId = route.params.sessionId as string
    sessionStore.updateSession(sessionId, newTitle)
  }
}

async function handleDelete() {
  if (confirm('确定要删除这个对话吗？')) {
    const sessionId = route.params.sessionId as string
    await sessionStore.deleteSession(sessionId)
    router.push('/chat/new')
  }
}

const EditIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `,
}

const TrashIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `,
}
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  position: relative;
  min-height: 48px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-light);
}

.chat-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
  text-align: center;
  letter-spacing: -0.01em;
}

.chat-actions {
  display: flex;
  gap: 4px;
  position: absolute;
  right: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.action-btn:hover {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

.action-btn--danger:hover {
  color: var(--destructive);
  background-color: rgba(239, 68, 68, 0.08);
}
</style>
