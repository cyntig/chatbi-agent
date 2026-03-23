<template>
  <div class="session-list">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="加载中..." />
    </div>
    <div v-else-if="sessions.length === 0" class="empty-state">
      <p class="empty-text">暂无对话</p>
    </div>
    <div v-else class="sessions">
      <SessionItem
        v-for="session in sessions"
        :key="session.session_id"
        :session="session"
        :active="session.session_id === currentSessionId"
        @delete="handleDeleteSession"
        @edit="handleEditSession"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import SessionItem from './SessionItem.vue'

const route = useRoute()
const sessionStore = useSessionStore()

const sessions = computed(() => sessionStore.sessions)
const isLoading = computed(() => sessionStore.isLoading)
const currentSessionId = computed(() => route.params.sessionId as string)

async function handleDeleteSession(sessionId: string) {
  try {
    await sessionStore.deleteSession(sessionId)
  } catch (error) {
    console.error('Failed to delete session:', error)
  }
}

async function handleEditSession(sessionId: string, newTitle: string) {
  try {
    await sessionStore.updateSession(sessionId, newTitle)
  } catch (error) {
    console.error('Failed to update session:', error)
  }
}
</script>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-text {
  font-size: 0.8125rem;
  color: var(--text-sidebar-secondary);
  margin: 0;
}

.sessions {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  gap: 2px;
}
</style>
