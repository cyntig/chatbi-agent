<template>
  <div
    class="session-item"
    :class="{ active }"
    @click="emit('select')"
  >
    <div class="session-content">
      <span v-if="!isEditing" class="session-title">{{ session.title }}</span>
      <input
        v-else
        ref="inputRef"
        v-model="editTitle"
        class="rename-input"
        @keydown.enter="confirmRename"
        @keydown.escape="cancelRename"
        @blur="confirmRename"
      />
    </div>
    <div class="session-actions" v-if="!isEditing">
      <button class="action-btn" title="重命名" @click.stop="startRename">
        <span>&#9998;</span>
      </button>
      <button class="action-btn delete" title="删除" @click.stop="emit('delete')">
        <span>&times;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Session } from '@/types'

const props = defineProps<{
  session: Session
  active: boolean
}>()

const emit = defineEmits<{
  select: []
  delete: []
  rename: [title: string]
}>()

const isEditing = ref(false)
const editTitle = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startRename() {
  editTitle.value = props.session.title
  isEditing.value = true
  nextTick(() => inputRef.value?.focus())
}

function confirmRename() {
  if (isEditing.value && editTitle.value.trim()) {
    emit('rename', editTitle.value.trim())
  }
  isEditing.value = false
}

function cancelRename() {
  isEditing.value = false
}
</script>

<style scoped>
.session-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
  gap: 4px;
}

.session-item:hover {
  background: var(--bg-sidebar-hover);
}

.session-item.active {
  background: var(--bg-sidebar-active);
}

.session-content {
  flex: 1;
  min-width: 0;
}

.session-title {
  color: var(--text-sidebar);
  font-size: var(--font-size-sm);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

.active .session-title {
  color: var(--text-sidebar-active);
}

.rename-input {
  width: 100%;
  background: var(--bg-sidebar-hover);
  border: 1px solid var(--accent);
  border-radius: 4px;
  color: var(--text-sidebar-active);
  padding: 2px 6px;
  font-size: var(--font-size-sm);
  outline: none;
}

.session-actions {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.session-item:hover .session-actions {
  display: flex;
}

.action-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--text-sidebar);
  font-size: 14px;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--bg-sidebar-active);
  color: var(--text-sidebar-active);
}

.action-btn.delete:hover {
  color: var(--danger);
}
</style>
