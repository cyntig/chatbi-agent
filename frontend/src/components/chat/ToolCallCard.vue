<template>
  <div class="tool-call-card">
    <div class="tool-header" @click="toggleExpand">
      <ToolIcon />
      <span class="tool-name">{{ toolCall.name }}</span>
      <ChevronIcon :class="{ expanded }" />
    </div>
    <div v-if="expanded" class="tool-body">
      <div class="tool-section">
        <h4>参数</h4>
        <pre class="tool-json">{{ formattedArguments }}</pre>
      </div>
      <div v-if="toolCall.output" class="tool-section">
        <h4>结果</h4>
        <pre class="tool-output">{{ formattedOutput }}</pre>
      </div>
      <div v-if="toolCall.content" class="tool-section">
        <h4>内容</h4>
        <div class="tool-content">{{ toolCall.content }}</div>
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

// 格式化参数为JSON显示，每个参数一行
const formattedArguments = computed(() => {
  console.log('Raw arguments:', props.toolCall.arguments)
  try {
    const parsed = JSON.parse(props.toolCall.arguments)
    console.log('Parsed arguments:', parsed)
    const lines: string[] = []
    for (const [key, value] of Object.entries(parsed)) {
      const valueStr = typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value)
      lines.push(`${key}: ${valueStr}`)
    }
    const result = lines.join('\n')
    console.log('Formatted arguments:', result)
    return result
  } catch (error) {
    console.error('Error parsing arguments JSON:', error)
    console.log('Falling back to raw string')
    return props.toolCall.arguments
  }
})

// 格式化输出为JSON显示（如果是JSON格式）
const formattedOutput = computed(() => {
  try {
    const parsed = JSON.parse(props.toolCall.output)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    // 如果不是JSON格式，直接返回原文本
    return props.toolCall.output
  }
})

// Icon components
const ToolIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
  `,
}

const ChevronIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ expanded: expanded }">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `,
  props: ['expanded'],
}
</script>

<style scoped>
.tool-call-card {
  margin-top: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

.tool-header:hover {
  background-color: var(--bg-tertiary);
}

.tool-name {
  flex: 1;
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.tool-header svg:last-child {
  transition: transform 0.2s;
}

.tool-header svg:last-child.expanded {
  transform: rotate(180deg);
}

.tool-body {
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.tool-json {
  margin: 0;
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  overflow-x: auto;
  color: var(--text-primary);
}

.tool-output {
  margin: 0;
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.375rem;
  font-size: 0.75rem;
  overflow-x: auto;
  color: var(--text-primary);
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.tool-content {
  padding: 0.75rem;
  background-color: var(--bg-tertiary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
  max-height: 300px;
  overflow-y: auto;
}
</style>
