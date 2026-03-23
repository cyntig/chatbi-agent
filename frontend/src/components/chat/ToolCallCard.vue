<template>
  <div class="tool-call-card">
    <button
      class="tool-header"
      @click="toggleExpand"
      :aria-expanded="expanded"
      :aria-label="`工具调用: ${toolCall.name}`"
    >
      <div class="tool-icon-wrapper">
        <ToolIcon />
      </div>
      <span class="tool-name">{{ toolCall.name }}</span>
      <span class="tool-chevron" :class="{ expanded }">
        <ChevronIcon />
      </span>
    </button>
    <div v-if="expanded" class="tool-body">
      <div class="tool-section">
        <div class="section-label">参数</div>
        <pre class="tool-code">{{ formattedArguments }}</pre>
      </div>
      <div v-if="toolCall.output" class="tool-section">
        <div class="section-label">结果</div>
        <pre class="tool-code tool-code--output">{{ formattedOutput }}</pre>
      </div>
      <div v-if="toolCall.content" class="tool-section">
        <div class="section-label">内容</div>
        <div class="tool-content-text">{{ toolCall.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ToolCall } from '@/types/api'

const props = defineProps<{
  toolCall: ToolCall
}>()

const expanded = ref(false)

function toggleExpand() {
  expanded.value = !expanded.value
}

const formattedArguments = computed(() => {
  try {
    const parsed = JSON.parse(props.toolCall.arguments)
    const lines: string[] = []
    for (const [key, value] of Object.entries(parsed)) {
      const valueStr = typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value)
      lines.push(`${key}: ${valueStr}`)
    }
    return lines.join('\n')
  } catch (error) {
    return props.toolCall.arguments
  }
})

const formattedOutput = computed(() => {
  try {
    const parsed = JSON.parse(props.toolCall.output)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return props.toolCall.output
  }
})

// Icon components
const ToolIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  `,
}

const ChevronIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,
}
</script>

<style scoped>
.tool-call-card {
  margin-top: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.625rem;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  width: 100%;
  background: none;
  border: none;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition-fast) ease;
}

.tool-header:hover {
  background-color: var(--hover-bg);
}

.tool-icon-wrapper {
  display: flex;
  align-items: center;
  color: var(--accent-color);
}

.tool-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}

.tool-chevron {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.tool-chevron.expanded {
  transform: rotate(180deg);
}

.tool-body {
  padding: 0.75rem 0.875rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-bottom: 0.375rem;
}

.tool-code {
  margin: 0;
  padding: 0.625rem 0.75rem;
  background-color: var(--code-bg);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  overflow-x: auto;
  color: var(--text-primary);
  line-height: 1.5;
}

.tool-code--output {
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.tool-content-text {
  padding: 0.625rem 0.75rem;
  background-color: var(--code-bg);
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
  max-height: 300px;
  overflow-y: auto;
  line-height: 1.5;
}
</style>
