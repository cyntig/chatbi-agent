<!-- Single message item component -->
<template>
  <div
    :class="['message-item', `message-item--${message.role}`]"
    :data-message-id="message.id"
  >
    <!-- Message Header -->
    <div class="message-item__header">
      <div class="message-item__avatar">
        <n-icon v-if="message.role === 'user'" size="20">
          <person-outline />
        </n-icon>
        <n-icon v-else size="20">
          <flash-outline />
        </n-icon>
      </div>
      <div class="message-item__meta">
        <span class="message-item__role">
          {{ roleLabel }}
        </span>
        <span class="message-item__time">
          {{ formattedTime }}
        </span>
      </div>
      <div v-if="message.role === 'assistant'" class="message-item__actions">
        <n-button quaternary circle size="tiny" @click="handleCopy">
          <template #icon>
            <n-icon><copy-outline /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- Message Content -->
    <div class="message-item__content">
      <div v-html="renderedContent" class="message-item__text"></div>

      <!-- Tool Calls -->
      <div v-if="hasTools" class="message-item__tools">
        <ToolExecution
          v-for="tool in message.metadata?.tools"
          :key="tool.id"
          :tool="tool"
        />
      </div>

      <!-- Charts -->
      <div v-if="hasCharts" class="message-item__charts">
        <div
          v-for="chart in message.metadata?.charts"
          :key="chart.id"
          class="message-item__chart"
        >
          <h4>{{ chart.title }}</h4>
          <ChartContainer :chart="chart" />
        </div>
      </div>

      <!-- Tables -->
      <div v-if="hasTables" class="message-item__tables">
        <div
          v-for="table in message.metadata?.tables"
          :key="table.id"
          class="message-item__table"
        >
          <h4>{{ table.title }}</h4>
          <DataTable :data="table" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import { NButton, NIcon } from 'naive-ui'
import {
  PersonOutline,
  FlashOutline,
  CopyOutline
} from '@vicons/ionicons5'
import MarkdownIt from 'markdown-it'
import { useFormatter } from '@/utils/formatter'
import { useChatStore } from '@/stores/chat'
import ChartContainer from './ChartContainer.vue'
import DataTable from './DataTable.vue'
import ToolExecution from './ToolExecution.vue'
import type { Message } from '@/types'

// Props
interface Props {
  message: Message
}

const props = defineProps<Props>()

// Composables
const message = useMessage()
const { formatTime } = useFormatter()
const chatStore = useChatStore()

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// Computed
const roleLabel = computed(() => {
  return props.message.role === 'user' ? '您' : 'AI 助手'
})

const formattedTime = computed(() => {
  return formatTime(props.message.timestamp)
})

const renderedContent = computed(() => {
  return md.render(props.message.content)
})

const hasTools = computed(() => {
  return props.message.metadata?.tools && props.message.metadata.tools.length > 0
})

const hasCharts = computed(() => {
  return props.message.metadata?.charts && props.message.metadata.charts.length > 0
})

const hasTables = computed(() => {
  return props.message.metadata?.tables && props.message.metadata.tables.length > 0
})

// Methods
function handleCopy() {
  navigator.clipboard.writeText(props.message.content)
  message.success('已复制到剪贴板')
}
</script>

<style scoped>
.message-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: var(--n-border-radius);
  animation: fadeIn 0.3s ease-in;
}

.message-item--user {
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
}

.message-item--assistant {
  background: transparent;
}

.message-item__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.message-item__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--n-primary-color);
  color: white;
  flex-shrink: 0;
}

.message-item--assistant .message-item__avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-item__meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.message-item__role {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--n-text-color);
}

.message-item__time {
  font-size: 0.75rem;
  color: var(--n-text-color-3);
}

.message-item__actions {
  display: flex;
  gap: 0.25rem;
}

.message-item__content {
  padding-left: 2.5rem;
}

.message-item__text {
  color: var(--n-text-color);
  line-height: 1.6;
  word-wrap: break-word;
}

.message-item__text :deep(p) {
  margin: 0.5rem 0;
}

.message-item__text :deep(code) {
  background: var(--n-code-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.message-item__text :deep(pre) {
  background: var(--n-code-color);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.message-item__tools {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.message-item__charts,
.message-item__tables {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-item__chart,
.message-item__table {
  padding: 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-border-color);
}

.message-item__chart h4,
.message-item__table h4 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--n-text-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>