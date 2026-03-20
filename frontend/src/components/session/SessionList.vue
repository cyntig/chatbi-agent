<template>
  <div class="session-list">
    <div v-if="isLoading" class="loading-state">
      <LoadingSpinner text="Loading sessions..." />
    </div>
    <div v-else-if="sessions.length === 0" class="empty-state">
      <p>No sessions yet</p>
      <p class="empty-hint">Start a new conversation</p>
    </div>
    <div v-else class="sessions">
      <SessionItem
        v-for="session in sessions"
        :key="session.session_id"
        :session="session"
        :is-active="session.session_id === currentSessionId"
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
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state p {
  margin: 0.25rem 0;
}

.empty-hint {
  font-size: 0.875rem;
}

.sessions {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
}
</style>
