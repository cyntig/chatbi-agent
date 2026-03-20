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

/**
 * 将连续的文本事件合并为一组
 * 工具调用事件保持独立
 */
const groupedEvents = computed(() => {
  const grouped: Array<MessageEvent | { type: 'text'; content: string }> = []
  let currentTextContent = ''

  for (const event of props.events) {
    if (event.type === 'text') {
      // 合并连续的文本事件
      currentTextContent += event.content || ''
    } else if (event.type === 'tool') {
      // 遇到工具调用，先保存之前的文本（如果有）
      if (currentTextContent) {
        grouped.push({ type: 'text', content: currentTextContent })
        currentTextContent = ''
      }
      // 添加工具调用事件
      grouped.push(event)
    }
  }

  // 保存最后的文本内容
  if (currentTextContent) {
    grouped.push({ type: 'text', content: currentTextContent })
  }

  return grouped
})

/**
 * 判断是否为最后一组（用于流式渲染）
 */
function isLastGroup(index: number): boolean {
  return index === groupedEvents.value.length - 1
}
</script>

<style scoped>
.message-events-renderer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.text-event {
  display: block;
}

.tool-event {
  display: block;
  margin-top: 0.5rem;
}
</style>
