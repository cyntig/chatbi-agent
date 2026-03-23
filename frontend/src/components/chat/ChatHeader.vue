<template>
  <header class="chat-header" role="banner">
    <h2 class="chat-title">{{ sessionTitle }}</h2>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()

const sessionTitle = computed(() => {
  return sessionStore.currentSession?.title || '新对话'
})
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
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
  text-align: left;
  letter-spacing: -0.01em;
}
</style>
