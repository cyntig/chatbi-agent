<template>
  <div
    class="session-item"
    :class="{ active }"
    role="button"
    :tabindex="0"
    :aria-current="active ? 'page' : undefined"
    :aria-label="session.title"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div class="session-content">
      <ChatIcon />
      <div v-if="!isEditing" class="session-title">{{ session.title }}</div>
      <div v-else class="session-edit" @click.stop>
        <input
          ref="editInput"
          v-model="editTitle"
          class="session-edit-input"
          aria-label="编辑会话标题"
          @keyup.enter="handleSaveEdit"
          @keyup.esc="handleCancelEdit"
        />
      </div>
    </div>
    <div class="session-actions" v-if="!isEditing">
      <button class="action-btn" @click.stop="handleEdit" aria-label="编辑标题">
        <EditIcon />
      </button>
      <button class="action-btn action-btn--danger" @click.stop="handleDelete" aria-label="删除会话">
        <TrashIcon />
      </button>
    </div>
    <div v-else class="session-edit-actions" @click.stop>
      <button class="edit-action-btn edit-action-btn--save" @click="handleSaveEdit" aria-label="保存">
        <CheckIcon />
      </button>
      <button class="edit-action-btn edit-action-btn--cancel" @click="handleCancelEdit" aria-label="取消">
        <XIcon />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { SessionInfo } from '@/types/api'

const props = defineProps<{
  session: SessionInfo
  active: boolean
}>()

const router = useRouter()
const emit = defineEmits<{
  delete: [sessionId: string]
  edit: [sessionId: string, newTitle: string]
}>()

const isEditing = ref(false)
const editTitle = ref(props.session.title)

function handleClick() {
  if (!isEditing.value) {
    router.push(`/chat/${props.session.session_id}`)
  }
}

async function handleEdit() {
  isEditing.value = true
  editTitle.value = props.session.title
  await nextTick()
  const input = document.querySelector('.session-edit-input') as HTMLInputElement
  input?.focus()
  input?.select()
}

async function handleSaveEdit() {
  const newTitle = editTitle.value.trim()
  if (newTitle && newTitle !== props.session.title) {
    emit('edit', props.session.session_id, newTitle)
  }
  isEditing.value = false
}

function handleCancelEdit() {
  isEditing.value = false
  editTitle.value = props.session.title
}

async function handleDelete() {
  if (confirm(`删除 "${props.session.title}"?`)) {
    emit('delete', props.session.session_id)
  }
}

// SVG Icons — consistent 1.5px stroke
const ChatIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `,
}

const EditIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  `,
}

const TrashIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  `,
}

const CheckIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  `,
}

const XIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `,
}
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast) ease;
  gap: 4px;
  min-height: 40px;
}

.session-item:hover {
  background-color: var(--bg-sidebar-hover);
}

.session-item.active {
  background-color: var(--bg-sidebar-active);
}

.session-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  color: var(--text-sidebar-secondary);
  transition: color var(--transition-fast) ease;
}

.session-item.active .session-content,
.session-item:hover .session-content {
  color: var(--text-sidebar);
}

.session-title {
  font-size: 0.8125rem;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  line-height: 1.4;
}

.session-edit {
  flex: 1;
  min-width: 0;
}

.session-edit-input {
  width: 100%;
  font-size: 0.8125rem;
  padding: 4px 6px;
  border: 1px solid var(--accent-color);
  border-radius: 4px;
  background-color: var(--bg-sidebar);
  color: var(--text-sidebar);
  outline: none;
  font-family: inherit;
}

.session-edit-input:focus {
  box-shadow: 0 0 0 2px var(--focus-ring);
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast) ease;
  flex-shrink: 0;
}

.session-item:hover .session-actions,
.session-item:focus-within .session-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-sidebar-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.action-btn:hover {
  color: var(--text-sidebar);
  background-color: rgba(255, 255, 255, 0.08);
}

.action-btn--danger:hover {
  color: var(--destructive);
  background-color: rgba(248, 113, 113, 0.12);
}

.session-edit-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.edit-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.edit-action-btn--save {
  color: var(--success);
}

.edit-action-btn--save:hover {
  background-color: rgba(16, 185, 129, 0.12);
}

.edit-action-btn--cancel {
  color: var(--destructive);
}

.edit-action-btn--cancel:hover {
  background-color: rgba(248, 113, 113, 0.12);
}
</style>
