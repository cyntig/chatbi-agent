<template>
  <div
    class="session-item"
    :class="{ active }"
    @click="handleClick"
  >
    <div class="session-content">
      <div class="session-icon">
        <MessageIcon />
      </div>
      <div class="session-info">
        <div class="session-title">{{ session.title }}</div>
        <div class="session-meta">
          {{ formatDate(session.updated_at) }}
        </div>
      </div>
    </div>
    <button
      class="delete-btn"
      @click.stop="handleDelete"
      title="Delete session"
    >
      <TrashIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '@/utils/format'
import type { SessionInfo } from '@/types/api'

const props = defineProps<{
  session: SessionInfo
  active: boolean
}>()

const router = useRouter()
const emit = defineEmits<{
  delete: [sessionId: string]
}>()

function handleClick() {
  router.push(`/chat/${props.session.session_id}`)
}

async function handleDelete() {
  if (confirm(`Delete "${props.session.title}"?`)) {
    emit('delete', props.session.session_id)
  }
}

function formatDate(date: string): string {
  return formatRelativeTime(date)
}

// Icon components
const MessageIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
}

const TrashIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `,
}
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid var(--border-color);
}

.session-item:hover {
  background-color: var(--bg-tertiary);
}

.session-item.active {
  background-color: var(--bg-tertiary);
  border-left: 3px solid var(--accent-color);
}

.session-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
  opacity: 0;
  transition: background-color 0.2s, opacity 0.2s;
}

.session-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: var(--bg-primary);
  color: #ef4444;
}
</style>
