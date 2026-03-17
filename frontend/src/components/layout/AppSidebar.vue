<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="handleNewChat">
        <span class="icon">+</span>
        <span>新对话</span>
      </button>
    </div>
    <div class="sidebar-body">
      <SessionList />
    </div>
    <div class="sidebar-footer">
      <span class="brand">ChatBI</span>
    </div>
  </aside>
</template>

<script setup lang="ts">
import SessionList from '@/components/session/SessionList.vue'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import { useRouter } from 'vue-router'

const sessionStore = useSessionStore()
const chatStore = useChatStore()
const router = useRouter()

async function handleNewChat() {
  const sessionId = await sessionStore.createNewSession()
  chatStore.clearMessages()
  router.push(`/chat/${sessionId}`)
}
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background: var(--bg-sidebar);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.sidebar-header {
  padding: 12px;
}

.new-chat-btn {
  width: 100%;
  padding: 10px 16px;
  background: var(--bg-sidebar-hover);
  color: var(--text-sidebar);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-size-base);
  transition: background var(--transition-fast);
}

.new-chat-btn:hover {
  background: var(--bg-sidebar-active);
  color: var(--text-sidebar-active);
}

.new-chat-btn .icon {
  font-size: 18px;
  font-weight: 300;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--bg-sidebar-hover);
  text-align: center;
}

.brand {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  letter-spacing: 1px;
}
</style>
