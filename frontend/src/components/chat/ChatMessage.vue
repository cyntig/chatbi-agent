<template>
  <div :class="['chat-message', message.role]">
    <div class="message-avatar">
      <UserIcon v-if="message.role === 'user'" />
      <BotIcon v-else />
    </div>
    <div class="message-content">
      <!-- 用户消息：直接显示内容 -->
      <div v-if="message.role === 'user'" class="user-content">
        {{ message.content }}
      </div>

      <!-- 助手消息：使用事件渲染器按顺序显示 -->
      <div v-else-if="message.events && message.events.length > 0">
        <MessageEventsRenderer
          :events="message.events"
          :is-streaming="!!message.isStreaming"
        />
      </div>

      <!-- 兼容旧数据：没有events数组的情况 -->
      <div v-else>
        <StreamingText v-if="message.isStreaming" :content="message.content" />
        <MarkdownRenderer v-else :content="message.content" />
        <ToolCallCard
          v-for="tool in message.toolCalls"
          :key="tool.name + tool.arguments"
          :tool-call="tool"
        />
      </div>
    </div>
    <div class="message-time">
      {{ formatTime(message.timestamp) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '@/utils/format'
import type { ChatMessage } from '@/types/chat'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import StreamingText from './StreamingText.vue'
import ToolCallCard from './ToolCallCard.vue'
import MessageEventsRenderer from './MessageEventsRenderer.vue'

defineProps<{
  message: ChatMessage
}>()

function formatTime(timestamp: string): string {
  return formatRelativeTime(timestamp)
}

// Icon components
const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `,
}

const BotIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2"></rect>
      <circle cx="12" cy="5" r="2"></circle>
      <path d="M12 7v4"></path>
      <line x1="8" y1="16" x2="8" y2="16"></line>
      <line x1="16" y1="16" x2="16" y2="16"></line>
    </svg>
  `,
}
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.5rem;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.user-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
}

.chat-message.user {
  background-color: transparent;
}

.chat-message.user .message-content {
  background-color: var(--user-message-bg);
  color: var(--user-message-text);
  padding: 0.75rem 1rem;
  border-radius: 1rem 1rem 0 1rem;
}

.chat-message.assistant .message-content {
  background-color: var(--ai-message-bg);
  color: var(--ai-message-text);
  padding: 0.75rem 1rem;
  border-radius: 1rem 1rem 1rem 0;
}
</style>
