<!-- Session item component -->
<template>
  <div
    :class="['session-item', { 'session-item--active': active }]"
    @click="handleClick"
  >
    <!-- Session Info -->
    <div class="session-item__info">
      <div class="session-item__header">
        <h4 class="session-item__title">{{ session.title }}</h4>
        <n-dropdown
          trigger="click"
          :options="menuOptions"
          placement="bottom-end"
          @select="handleMenuSelect"
          @click.stop
        >
          <n-button quaternary circle size="tiny" class="session-item__menu">
            <template #icon>
              <n-icon><ellipsis-vertical-outline /></n-icon>
            </template>
          </n-button>
        </n-dropdown>
      </div>

      <p class="session-item__message">
        {{ session.lastMessage || '暂无消息' }}
      </p>

      <div class="session-item__meta">
        <span class="session-item__time">{{ formattedTime }}</span>
        <span class="session-item__count">{{ session.messageCount }} 条消息</span>
      </div>
    </div>

    <!-- Active Indicator -->
    <div v-if="active" class="session-item__indicator"></div>
  </div>
</template>

<script setup lang="ts">
import { h, computed } from 'vue'
import { NButton, NIcon, NDropdown, NText } from 'naive-ui'
import {
  EllipsisVerticalOutline,
  TrashOutline,
  CreateOutline,
  CopyOutline
} from '@vicons/ionicons5'
import { useFormatter } from '@/utils/formatter'
import { useMessage } from 'naive-ui'
import type { Session } from '@/types'

// Props
interface Props {
  session: Session
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

// Emits
interface Emits {
  (e: 'select', sessionId: string): void
  (e: 'delete', sessionId: string): void
  (e: 'rename', sessionId: string, newTitle: string): void
}

const emit = defineEmits<Emits>()

// Composables
const { formatRelativeTime } = useFormatter()
const message = useMessage()

// Computed
const formattedTime = computed(() => {
  return formatRelativeTime(props.session.updatedAt)
})

const menuOptions = computed(() => [
  {
    label: '重命名',
    key: 'rename',
    icon: () => h(NIcon, null, { default: () => h(CreateOutline) })
  },
  {
    label: '复制',
    key: 'copy',
    icon: () => h(NIcon, null, { default: () => h(CopyOutline) })
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: '删除',
    key: 'delete',
    icon: () => h(NIcon, null, { default: () => h(TrashOutline) }),
    props: {
      style: {
        color: 'var(--n-error-color)'
      }
    }
  }
])

// Methods
function handleClick() {
  emit('select', props.session.id)
}

function handleMenuSelect(key: string) {
  switch (key) {
    case 'rename':
      handleRename()
      break
    case 'copy':
      handleCopy()
      break
    case 'delete':
      emit('delete', props.session.id)
      break
  }
}

function handleRename() {
  const newTitle = prompt('请输入新的会话名称:', props.session.title)
  if (newTitle && newTitle.trim()) {
    emit('rename', props.session.id, newTitle.trim())
  }
}

function handleCopy() {
  const sessionCopy = {
    ...props.session,
    id: undefined, // Will be generated as new
    title: `${props.session.title} (副本)`,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // This would need to be handled by the parent component
  message.info('会话复制功能（演示）')
}
</script>

<style scoped>
.session-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: var(--n-border-radius);
  cursor: pointer;
  transition: all 0.2s;
  gap: 0.75rem;
}

.session-item:hover {
  border-color: var(--n-primary-color);
  background: var(--n-color-hover);
}

.session-item--active {
  border-color: var(--n-primary-color);
  background: rgba(24, 160, 88, 0.1);
}

.session-item__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.session-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.session-item__title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--n-text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-item__menu {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.session-item:hover .session-item__menu {
  opacity: 1;
}

.session-item__message {
  margin: 0;
  font-size: 0.75rem;
  color: var(--n-text-color-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-item__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--n-text-color-3);
}

.session-item__indicator {
  flex-shrink: 0;
  width: 4px;
  height: 32px;
  background: var(--n-primary-color);
  border-radius: 2px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>