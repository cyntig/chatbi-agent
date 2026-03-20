<template>
  <div class="chat-header">
    <h2 class="chat-title">{{ sessionTitle }}</h2>
    <div class="chat-actions">
      <button class="action-btn" @click="handleRename" title="Rename">
        <EditIcon />
      </button>
      <button class="action-btn" @click="handleDelete" title="Delete">
        <TrashIcon />
      </button>
    </div>
  </div>
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
  const newTitle = prompt('Enter new title:', sessionTitle.value)
  if (newTitle && newTitle !== sessionTitle.value) {
    const sessionId = route.params.sessionId as string
    sessionStore.updateSession(sessionId, newTitle)
  }
}

async function handleDelete() {
  if (confirm('Are you sure you want to delete this session?')) {
    const sessionId = route.params.sessionId as string
    await sessionStore.deleteSession(sessionId)
    router.push('/chat/new')
  }
}

// Icon components
const EditIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `,
}

const TrashIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.chat-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s, color 0.2s;
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
