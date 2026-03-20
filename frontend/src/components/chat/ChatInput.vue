<template>
  <div class="chat-input">
    <div class="input-container">
      <textarea
        ref="textareaRef"
        v-model="inputContent"
        class="input-field"
        placeholder="输入您的问题... (Shift + Enter 换行)"
        rows="1"
        @keydown="handleKeydown"
        @input="adjustHeight"
      ></textarea>
      <button
        class="send-btn"
        :disabled="!canSend"
        @click="handleSend"
      >
        <SendIcon v-if="!isStreaming" />
        <StopIcon v-else />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'

const route = useRoute()
const chatStore = useChatStore()
const sessionStore = useSessionStore()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const inputContent = ref('')

const isStreaming = computed(() => chatStore.isStreaming)
const canSend = computed(() => inputContent.value.trim() && !isStreaming.value)

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

async function handleSend() {
  if (!canSend.value) return

  const message = inputContent.value.trim()
  if (!message) return

  const sessionId = route.params.sessionId as string

  // If session is 'new', create a new session first
  if (sessionId === 'new') {
    try {
      const newSession = await sessionStore.createSession()
      await chatStore.sendMessage(newSession.session_id, message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  } else {
    await chatStore.sendMessage(sessionId, message)
  }

  inputContent.value = ''
  adjustHeight()
}

function adjustHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      const newHeight = Math.min(textareaRef.value.scrollHeight, 200)
      textareaRef.value.style.height = newHeight + 'px'
    }
  })
}

// Icon components
const SendIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  `,
}

const StopIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    </svg>
  `,
}
</script>

<style scoped>
.chat-input {
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: border-color 0.2s;
}

.input-container:focus-within {
  border-color: var(--accent-color);
}

.input-field {
  flex: 1;
  border: none;
  background: transparent;
  resize: none;
  outline: none;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--text-primary);
  font-family: inherit;
  min-height: 24px;
  max-height: 200px;
}

.input-field::placeholder {
  color: var(--text-secondary);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s, opacity 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
