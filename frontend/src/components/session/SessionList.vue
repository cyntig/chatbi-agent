<!-- Session list component -->
<template>
  <div class="session-list">
    <!-- Session Search -->
    <div class="session-list__search">
      <SessionSearch v-model="searchQuery" />
    </div>

    <!-- New Session Button -->
    <div class="session-list__new">
      <n-button
        type="primary"
        block
        @click="handleNewSession"
      >
        <template #icon>
          <n-icon><add-outline /></n-icon>
        </template>
        新建会话
      </n-button>
    </div>

    <!-- Sessions -->
    <div class="session-list__sessions">
      <div v-if="filteredSessions.length === 0" class="session-list__empty">
        <n-empty
          v-if="searchQuery"
          description="没有找到匹配的会话"
          size="small"
        />
        <n-empty
          v-else
          description="还没有会话"
          size="small"
        />
      </div>

      <SessionItem
        v-for="session in filteredSessions"
        :key="session.id"
        :session="session"
        :active="session.id === currentSessionId"
        @select="handleSelectSession"
        @delete="handleDeleteSession"
        @rename="handleRenameSession"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NIcon, NEmpty } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
import SessionSearch from './SessionSearch.vue'
import SessionItem from './SessionItem.vue'

// Stores & Composables
const sessionStore = useSessionStore()
const chatStore = useChatStore()
const { clearChat } = useChat()

// State
const searchQuery = ref('')

// Computed
const currentSessionId = computed(() => sessionStore.currentSessionId)

const filteredSessions = computed(() => {
  const sessions = sessionStore.sessions

  if (!searchQuery.value) {
    return sessions
  }

  const query = searchQuery.value.toLowerCase()
  return sessions.filter(session =>
    session.title.toLowerCase().includes(query) ||
    session.lastMessage?.toLowerCase().includes(query)
  )
})

// Methods
function handleNewSession() {
  const newSession = sessionStore.createSession()
  sessionStore.switchSession(newSession.id)
  clearChat()
}

function handleSelectSession(sessionId: string) {
  sessionStore.switchSession(sessionId)
  chatStore.setCurrentSession(sessionId)
}

function handleDeleteSession(sessionId: string) {
  sessionStore.deleteSession(sessionId)

  // If deleted session was current, switch to another
  if (sessionId === currentSessionId.value) {
    const remainingSessions = sessionStore.sessions
    if (remainingSessions.length > 0) {
      handleSelectSession(remainingSessions[0].id)
    } else {
      handleNewSession()
    }
  }
}

function handleRenameSession(sessionId: string, newTitle: string) {
  sessionStore.updateSessionTitle(sessionId, newTitle)
}
</script>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--n-color);
  border-right: 1px solid var(--n-border-color);
}

.session-list__search {
  flex-shrink: 0;
}

.session-list__new {
  flex-shrink: 0;
}

.session-list__sessions {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
}

.session-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  min-height: 200px;
}
</style>