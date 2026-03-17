<template>
  <div class="tool-call-card" :class="{ expanded: toolCall.isExpanded }">
    <div class="tool-header" @click="toolCall.isExpanded = !toolCall.isExpanded">
      <span class="tool-icon">&#128295;</span>
      <span class="tool-name">{{ toolCall.name }}</span>
      <span class="toggle-icon">{{ toolCall.isExpanded ? '&#9650;' : '&#9660;' }}</span>
    </div>
    <div v-if="toolCall.isExpanded" class="tool-body">
      <div class="tool-section">
        <div class="section-label">Input</div>
        <pre class="section-content"><code>{{ formatJson(toolCall.arguments) }}</code></pre>
      </div>
      <div class="tool-section" v-if="toolCall.output !== null && toolCall.output !== undefined">
        <div class="section-label">Output</div>
        <pre class="section-content"><code>{{ truncateOutput(formatJson(toolCall.output)) }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolCall } from '@/types'

defineProps<{
  toolCall: ToolCall
}>()

const MAX_OUTPUT_LEN = 2000

function formatJson(value: any): string {
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }
  return JSON.stringify(value, null, 2)
}

function truncateOutput(text: string): string {
  if (text.length > MAX_OUTPUT_LEN) {
    return text.slice(0, MAX_OUTPUT_LEN) + '\n... (已截断)'
  }
  return text
}
</script>

<style scoped>
.tool-call-card {
  background: var(--bg-tool-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin: 8px 0;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-fast);
}

.tool-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.tool-icon {
  font-size: 14px;
}

.tool-name {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--accent);
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}

.toggle-icon {
  font-size: 10px;
  color: var(--text-secondary);
}

.tool-body {
  border-top: 1px solid var(--border-light);
  padding: 12px;
}

.tool-section + .tool-section {
  margin-top: 12px;
}

.section-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.section-content {
  background: var(--bg-white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  overflow-x: auto;
  font-size: var(--font-size-xs);
  line-height: 1.5;
  margin: 0;
  color: var(--text-primary);
}

.section-content code {
  background: none;
  padding: 0;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
</style>
