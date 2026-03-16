<!-- Chat interface main container -->
<template>
  <div class="chat-interface">
    <!-- Message List -->
    <MessageList class="chat-interface__messages" />

    <!-- Streaming Content -->
    <div v-if="streamingContent" class="chat-interface__streaming">
      <StreamingText :content="streamingContent" />
    </div>

    <!-- Tool Execution Display -->
    <div v-if="currentTool" class="chat-interface__tool">
      <ToolExecution :tool="currentTool" />
    </div>

    <!-- Input Area -->
    <InputArea
      class="chat-interface__input"
      :disabled="isStreaming || isSending"
      @send="handleSendMessage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChat } from '@/composables/useChat'
import { useChatStore } from '@/stores/chat'
import MessageList from './MessageList.vue'
import StreamingText from './StreamingText.vue'
import ToolExecution from './ToolExecution.vue'
import InputArea from './InputArea.vue'

// Composables
const chatStore = useChatStore()
const { sendMessage, isSending } = useChat()

// Computed
const streamingContent = computed(() => chatStore.streamingContent)
const currentTool = computed(() => chatStore.currentTool)
const isStreaming = computed(() => chatStore.isStreaming)

// Methods
async function handleSendMessage(message: string) {
  await sendMessage(message)
}
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 1rem;
  padding: 1rem;
}

.chat-interface__messages {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.chat-interface__streaming {
  padding: 0.75rem 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  animation: fadeIn 0.3s ease-in;
}

.chat-interface__tool {
  padding: 0.75rem 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  animation: slideIn 0.3s ease-out;
}

.chat-interface__input {
  flex-shrink: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>