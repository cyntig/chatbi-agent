<!-- Streaming text component -->
<template>
  <div class="streaming-text">
    <!-- Avatar -->
    <div class="streaming-text__avatar">
      <n-icon size="20">
        <flash-outline />
      </n-icon>
    </div>

    <!-- Content -->
    <div class="streaming-text__content">
      <div class="streaming-text__header">
        <span class="streaming-text__role">AI 助手</span>
        <span class="streaming-text__status">正在输入...</span>
      </div>

      <div class="streaming-text__text">
        <span v-html="renderedContent"></span>
        <span class="streaming-text__cursor"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { FlashOutline } from '@vicons/ionicons5'
import MarkdownIt from 'markdown-it'

// Props
interface Props {
  content: string
}

const props = defineProps<Props>()

// Markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

// Computed
const renderedContent = computed(() => {
  if (!props.content) return ''
  // Don't render incomplete markdown blocks while streaming
  const lines = props.content.split('\n')
  const completeLines: string[] = []
  const incompleteLine = lines[lines.length - 1]

  for (let i = 0; i < lines.length - 1; i++) {
    completeLines.push(lines[i])
  }

  let rendered = md.render(completeLines.join('\n'))
  if (incompleteLine) {
    rendered += `<span>${incompleteLine}</span>`
  }

  return rendered
})
</script>

<style scoped>
.streaming-text {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-border-color);
}

.streaming-text__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

.streaming-text__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.streaming-text__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.streaming-text__role {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--n-text-color);
}

.streaming-text__status {
  font-size: 0.75rem;
  color: var(--n-primary-color);
  animation: blink 1.5s ease-in-out infinite;
}

.streaming-text__text {
  color: var(--n-text-color);
  line-height: 1.6;
  word-wrap: break-word;
}

.streaming-text__text :deep(p) {
  margin: 0.5rem 0;
}

.streaming-text__text :deep(code) {
  background: var(--n-code-color);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9em;
}

.streaming-text__cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: var(--n-primary-color);
  margin-left: 2px;
  animation: cursorBlink 1s step-end infinite;
  vertical-align: text-bottom;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes cursorBlink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>