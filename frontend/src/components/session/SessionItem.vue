<template>
  <div
    class="session-item"
    :class="{ active }"
    role="option"
    :tabindex="0"
    :aria-current="active ? 'page' : undefined"
    :aria-selected="active"
    :aria-label="session.title"
    @click="handleClick"
    @keydown.enter="handleClick"
  >
    <div class="session-content">
      <div v-if="!isEditing" class="session-title" :title="session.title">{{ session.title }}</div>
      <div v-else class="session-edit" @click.stop>
        <input
          ref="editInputRef"
          v-model="editTitle"
          class="session-edit-input"
          aria-label="编辑会话标题"
          @keyup.enter="handleSaveEdit"
          @keyup.esc="handleCancelEdit"
        />
      </div>
    </div>

    <!-- Fade mask for long text (only when not editing and not hovered) -->
    <div v-if="!isEditing" class="session-fade" />

    <div class="session-actions" v-if="!isEditing">
      <button class="action-btn" @click.stop="handleEdit" aria-label="编辑标题">
        <Pencil :size="14" :stroke-width="1.5" />
      </button>
      <button class="action-btn action-btn--danger" @click.stop="showDeleteDialog = true" aria-label="删除会话">
        <Trash2 :size="14" :stroke-width="1.5" />
      </button>
    </div>
    <div v-else class="session-edit-actions" @click.stop>
      <button class="edit-action-btn edit-action-btn--save" @click="handleSaveEdit" aria-label="保存">
        <Check :size="14" :stroke-width="2" />
      </button>
      <button class="edit-action-btn edit-action-btn--cancel" @click="handleCancelEdit" aria-label="取消">
        <X :size="14" :stroke-width="2" />
      </button>
    </div>

    <ConfirmDialog
      :visible="showDeleteDialog"
      title="删除对话"
      :message="`确定要删除 &quot;${session.title}&quot; 吗？`"
      confirm-text="删除"
      cancel-text="取消"
      variant="danger"
      @update:visible="showDeleteDialog = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, Trash2, Check, X } from 'lucide-vue-next'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
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
const showDeleteDialog = ref(false)
const editInputRef = ref<HTMLInputElement | null>(null)

function handleClick() {
  if (!isEditing.value) {
    router.push(`/chat/${props.session.session_id}`)
  }
}

async function handleEdit() {
  isEditing.value = true
  editTitle.value = props.session.title
  await nextTick()
  editInputRef.value?.focus()
  editInputRef.value?.select()
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

function confirmDelete() {
  emit('delete', props.session.session_id)
}
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-fast) ease;
  gap: 0;
  min-height: 36px;
  position: relative;
  overflow: hidden;
}

.session-item:hover {
  background-color: var(--hover-bg);
}

.session-item.active {
  background-color: var(--hover-bg);
}

.session-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  color: var(--text-sidebar);
  overflow: hidden;
}

.session-item.active .session-content {
  color: var(--text-sidebar);
  font-weight: 500;
}

.session-title {
  font-size: 0.8125rem;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  flex: 1;
  line-height: 1.5;
}

/* Fade gradient to hide overflow text */
.session-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 48px;
  background: linear-gradient(to left, var(--bg-sidebar) 0%, transparent 100%);
  pointer-events: none;
  transition: opacity var(--transition-fast) ease;
}

.session-item:hover .session-fade,
.session-item:focus-within .session-fade {
  width: 72px;
  background: linear-gradient(to left, var(--bg-sidebar) 40%, transparent 100%);
}

/* Adjust fade for active item */
.session-item.active .session-fade {
  background: linear-gradient(to left, var(--bg-sidebar) 0%, transparent 100%);
}

.session-item.active:hover .session-fade {
  background: linear-gradient(to left, var(--bg-sidebar) 40%, transparent 100%);
}

.session-edit {
  flex: 1;
  min-width: 0;
}

.session-edit-input {
  width: 100%;
  font-size: 0.8125rem;
  padding: 3px 6px;
  border: 1px solid var(--accent-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  font-family: inherit;
}

.session-edit-input:focus {
  box-shadow: 0 0 0 2px var(--focus-ring);
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  opacity: 0;
  transition: opacity var(--transition-fast) ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.session-item:hover .session-actions,
.session-item:focus-within .session-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.action-btn:hover {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

.action-btn--danger:hover {
  color: var(--destructive);
  background-color: rgba(239, 68, 68, 0.08);
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
  width: 26px;
  height: 26px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.edit-action-btn--save {
  color: var(--success);
}

.edit-action-btn--save:hover {
  background-color: rgba(16, 185, 129, 0.08);
}

.edit-action-btn--cancel {
  color: var(--destructive);
}

.edit-action-btn--cancel:hover {
  background-color: rgba(239, 68, 68, 0.08);
}
</style>
