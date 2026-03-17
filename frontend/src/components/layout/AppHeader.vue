<template>
  <header class="app-header" v-if="sessionStore.currentSession">
    <h1 class="title">{{ sessionStore.currentSession.title }}</h1>
  </header>
</template>

<script setup lang="ts">
import { useSessionStore } from '@/stores/session'

const sessionStore = useSessionStore()
</script>

<style scoped>
.app-header {
  height: var(--header-height);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: var(--bg-white);
}

.title {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
