<template>
  <div class="message-events-renderer">
    <template v-for="(event, index) in groupedEvents" :key="index">
      <!-- 文本事件组 -->
      <div v-if="event.type === 'text'" class="text-event">
        <StreamingText
          v-if="isStreaming && isLastGroup(index)"
          :content="event.content || ''"
        />
        <MarkdownRenderer v-else :content="event.content || ''" />
      </div>

      <!-- 工具调用事件 -->
      <div v-else-if="event.type === 'tool'" class="tool-event">
        <ToolCallCard :tool-call="event.toolCall!" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MessageEvent } from '@/types/chat'
import StreamingText from './StreamingText.vue'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import ToolCallCard from './ToolCallCard.vue'

const props = defineProps<{
  events: MessageEvent[]
  isStreaming: boolean
}>()

const groupedEvents = computed(() => {
  const grouped: Array<MessageEvent | { type: 'text'; content: string }> = []
  let currentTextContent = ''

  for (const event of props.events) {
    if (event.type === 'text') {
      currentTextContent += event.content || ''
    } else if (event.type === 'tool') {
      if (currentTextContent) {
        grouped.push({ type: 'text', content: currentTextContent })
        currentTextContent = ''
      }
      grouped.push(event)
    }
  }

  if (currentTextContent) {
    grouped.push({ type: 'text', content: currentTextContent })
  }

  return grouped
})

function isLastGroup(index: number): boolean {
  return index === groupedEvents.value.length - 1
}
</script>

<style scoped>
.message-events-renderer {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.text-event {
  display: block;
}

.tool-event {
  display: block;
  margin: 0.25rem 0;
}
</style>
