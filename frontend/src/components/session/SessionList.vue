<template>
  <div
    class="session-list"
    role="listbox"
    aria-label="会话列表"
    @keydown="handleKeydown"
  >
    <div v-if="isLoading" class="loading-state">
      <div class="skeleton-list">
        <div v-for="i in 5" :key="i" class="skeleton-item">
          <div class="skeleton skeleton-text" :style="{ width: `${50 + Math.random() * 40}%` }"></div>
        </div>
      </div>
    </div>
    <div v-else-if="filteredSessions.length === 0 && searchQuery" class="empty-state">
      <p class="empty-text">无匹配结果</p>
    </div>
    <div v-else-if="filteredSessions.length === 0" class="empty-state">
      <p class="empty-text">暂无对话</p>
    </div>
    <div v-else class="sessions" ref="sessionsRef">
      <SessionItem
        v-for="(session, index) in filteredSessions"
        :key="session.session_id"
        :session="session"
        :active="session.session_id === currentSessionId"
        :data-index="index"
        @delete="handleDeleteSession"
        @edit="handleEditSession"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import SessionItem from './SessionItem.vue'

const props = withDefaults(defineProps<{
  searchQuery?: string
}>(), {
  searchQuery: ''
})

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const sessionsRef = ref<HTMLElement | null>(null)

const sessions = computed(() => sessionStore.sessions)
const isLoading = computed(() => sessionStore.isLoading)
const currentSessionId = computed(() => route.params.sessionId as string)

const filteredSessions = computed(() => {
  if (!props.searchQuery.trim()) return sessions.value
  const q = props.searchQuery.trim().toLowerCase()
  return sessions.value.filter(s => s.title.toLowerCase().includes(q))
})

function handleKeydown(e: KeyboardEvent) {
  if (!filteredSessions.value.length) return

  const currentIndex = filteredSessions.value.findIndex(s => s.session_id === currentSessionId.value)

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    const nextIndex = Math.min(currentIndex + 1, filteredSessions.value.length - 1)
    navigateToSession(nextIndex)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    const prevIndex = Math.max(currentIndex - 1, 0)
    navigateToSession(prevIndex)
  }
}

function navigateToSession(index: number) {
  const session = filteredSessions.value[index]
  if (session) {
    router.push(`/chat/${session.session_id}`)
    const items = sessionsRef.value?.querySelectorAll('.session-item')
    if (items?.[index]) {
      (items[index] as HTMLElement).focus()
    }
  }
}

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

.loading-state {
  justify-content: flex-start;
  padding-top: 0.5rem;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.skeleton-item {
  display: flex;
  align-items: center;
  padding: 10px 10px;
  border-radius: var(--radius-lg);
}

.skeleton-text {
  height: 13px;
  border-radius: var(--radius-sm);
}

.skeleton-item .skeleton {
  background: linear-gradient(
    90deg,
    var(--hover-bg) 25%,
    transparent 50%,
    var(--hover-bg) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.empty-text {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0;
}

.sessions {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  gap: 1px;
}
</style>
