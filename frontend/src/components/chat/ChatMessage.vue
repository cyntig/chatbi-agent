<template>
  <article :class="['chat-message', message.role]" :aria-label="message.role === 'user' ? '用户消息' : 'ChatBI 回复'">
    <div class="message-row">
      <div class="message-body">
        <div class="message-content" :class="{ 'user-bubble': message.role === 'user' }">
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

const props = defineProps<{
  message: ChatMessage
}>()
</script>

<style scoped>
.chat-message {
  padding: 24px 0;
  animation: messageIn 300ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

.chat-message + .chat-message {
  padding-top: 8px;
}

@keyframes messageIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Assistant 靠左 */
.chat-message.assistant .message-row {
  display: flex;
  width: 100%;
  justify-content: flex-start;
}

/* User 靠右 */
.chat-message.user .message-row {
  display: flex;
  width: 100%;
  justify-content: flex-end;
}

.chat-message.user .message-body {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-body {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.message-content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-primary);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-content.user-bubble {
  background-color: #f4f4f4;
  border-radius: 1.25rem;
  padding: 10px 14px;
  border: none;
}

.dark .message-content.user-bubble {
  background-color: #2f2f2f;
}

.user-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

@media (prefers-reduced-motion: reduce) {
  .chat-message {
    animation: none;
  }
}
</style>
