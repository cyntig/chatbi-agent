<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="handleNewChat">
        <PlusIcon />
        <span v-if="!appStore.sidebarCollapsed">新对话</span>
      </button>
    </div>
    <div class="sidebar-content">
      <SessionList />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSessionStore } from '@/stores/session'
import SessionList from '@/components/session/SessionList.vue'

const router = useRouter()
const appStore = useAppStore()
const sessionStore = useSessionStore()

async function handleNewChat() {
  try {
    const newSession = await sessionStore.createSession('新对话')
    router.push(`/chat/${newSession.session_id}`)
  } catch (error) {
    console.error('Failed to create new chat:', error)
  }
}

// Icon component
const PlusIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-chat-btn:hover {
  opacity: 0.9;
}

.sidebar.collapsed .new-chat-btn {
  padding: 0.75rem 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
}
</style>
