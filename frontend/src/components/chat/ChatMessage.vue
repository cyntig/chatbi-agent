<template>
  <article :class="['chat-message', message.role]" :aria-label="message.role === 'user' ? '用户消息' : 'ChatBI 回复'">
    <div class="message-row">
      <div class="message-avatar" aria-hidden="true">
        <div v-if="message.role === 'user'" class="avatar avatar--user">
          <UserIcon />
        </div>
        <div v-else class="avatar avatar--assistant">
          <BotIcon />
        </div>
      </div>
      <div class="message-body">
        <div class="message-role">{{ message.role === 'user' ? '你' : 'ChatBI' }}</div>
        <div class="message-content">
          <div v-if="message.role === 'user'" class="user-content">
            {{ message.content }}
          </div>

          <div v-else-if="message.events && message.events.length > 0">
            <MessageEventsRenderer
              :events="message.events"
              :is-streaming="!!message.isStreaming"
            />
          </div>

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
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ChatMessage } from '@/types/chat'
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue'
import StreamingText from './StreamingText.vue'
import ToolCallCard from './ToolCallCard.vue'
import MessageEventsRenderer from './MessageEventsRenderer.vue'

defineProps<{
  message: ChatMessage
}>()

// SVG Icons — consistent 1.5px stroke
const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  `,
}

const BotIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
      <path d="M2 17l10 5 10-5"></path>
      <path d="M2 12l10 5 10-5"></path>
    </svg>
  `,
}
</script>

<style scoped>
.chat-message {
  padding: 24px 0;
  animation: fadeIn var(--transition-slow) ease-out;
}

.chat-message.assistant {
  background-color: var(--ai-message-bg);
  margin: 0 -16px;
  padding: 24px 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-row {
  display: flex;
  gap: 16px;
  max-width: 768px;
  margin: 0 auto;
  width: 100%;
}

.message-avatar {
  flex-shrink: 0;
  padding-top: 2px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.avatar--user {
  background-color: var(--accent-color);
  color: #ffffff;
}

.avatar--assistant {
  background-color: var(--accent-subtle);
  color: var(--accent-color);
}

.message-body {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.message-role {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
  letter-spacing: -0.01em;
}

.message-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.user-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
