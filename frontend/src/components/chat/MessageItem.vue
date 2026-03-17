<template>
  <div class="message-item" :class="message.role">
    <div class="avatar">
      <span v-if="message.role === 'user'">&#128100;</span>
      <span v-else>&#129302;</span>
    </div>
    <div class="message-body">
      <!-- 用户消息 -->
      <div v-if="message.role === 'user'" class="user-content">
        {{ (message.parts[0] as any)?.content || '' }}
      </div>

      <!-- 助手消息：按 parts 顺序渲染 -->
      <template v-else>
        <template v-for="(part, idx) in message.parts" :key="idx">
          <ToolCallCard
            v-if="part.type === 'tool'"
            :tool-call="part.toolCall"
          />
          <MarkdownRenderer
            v-else-if="part.type === 'text' && part.content"
            :content="part.content"
            :streaming="message.isStreaming && idx === message.parts.length - 1"
          />
        </template>

        <!-- 流式输入指示器（还没有任何内容时显示） -->
        <StreamingIndicator v-if="message.isStreaming && message.parts.length === 0" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/types'
import ToolCallCard from './ToolCallCard.vue'
import MarkdownRenderer from './MarkdownRenderer.vue'
import StreamingIndicator from './StreamingIndicator.vue'

defineProps<{
  message: ChatMessage
}>()
</script>

<style scoped>
.message-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
}

.message-item + .message-item {
  border-top: 1px solid var(--border-light);
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: var(--bg-user-msg);
}

.message-item.assistant .avatar {
  background: var(--accent-light);
}

.message-body {
  flex: 1;
  min-width: 0;
}

.user-content {
  color: var(--text-primary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
