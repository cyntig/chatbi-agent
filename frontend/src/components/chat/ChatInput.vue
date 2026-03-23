<template>
  <div class="chat-input-wrapper">
    <div class="chat-input">
      <div class="input-container" :class="{ focused: isFocused }">
        <textarea
          ref="textareaRef"
          v-model="inputContent"
          class="input-field"
          placeholder="给 ChatBI 发送消息..."
          rows="1"
          aria-label="消息输入框"
          @keydown="handleKeydown"
          @input="adjustHeight"
          @focus="isFocused = true"
          @blur="isFocused = false"
        ></textarea>
        <button
          class="send-btn"
          :class="{ active: canSend, streaming: isStreaming }"
          :disabled="!canSend && !isStreaming"
          :aria-label="isStreaming ? '停止生成' : '发送消息'"
          @click="handleSend"
        >
          <Square v-if="isStreaming" :size="14" :stroke-width="0" fill="currentColor" />
          <Send v-else :size="16" :stroke-width="2" />
        </button>
      </div>
      <p class="input-hint" aria-hidden="true">ChatBI 可能会犯错。请核查重要信息。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { Send, Square } from 'lucide-vue-next'

const route = useRoute()
const chatStore = useChatStore()
const sessionStore = useSessionStore()

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const inputContent = ref('')
const isFocused = ref(false)

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

  inputContent.value = ''
  adjustHeight()

  const sessionId = route.params.sessionId as string

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
</script>

<style scoped>
.chat-input-wrapper {
  flex-shrink: 0;
  background: linear-gradient(to bottom, transparent 0%, var(--bg-primary) 40%);
  padding-top: 16px;
}

.chat-input {
  max-width: 768px;
  margin: 0 auto;
  padding: 0 16px 16px;
}

@media (min-width: 1024px) {
  .chat-input {
    max-width: 896px;
  }
}

@media (max-width: 767px) {
  .chat-input {
    padding: 0 12px 12px;
  }
}

.input-container {
  display: flex;
  align-items: flex-end;
  background-color: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: var(--radius-xl);
  padding: 12px 12px 12px 16px;
  box-shadow: var(--input-shadow);
  transition: border-color var(--transition-fast) ease,
              box-shadow var(--transition-fast) ease;
}

.input-container.focused {
  border-color: var(--accent-color);
  box-shadow: var(--input-shadow-focus), 0 0 0 1px var(--focus-ring);
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
  color: var(--text-tertiary);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast) ease,
              color var(--transition-fast) ease,
              transform var(--transition-fast) ease;
  flex-shrink: 0;
}

.send-btn.active {
  background-color: var(--accent-color);
  color: #ffffff;
}

.send-btn.active:hover {
  background-color: var(--accent-hover);
}

.send-btn.active:active {
  transform: scale(0.92);
}

.send-btn.streaming {
  background-color: var(--text-primary);
  color: var(--bg-primary);
  animation: pulse-subtle 1.5s ease-in-out infinite;
}

@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.send-btn.streaming:hover {
  opacity: 0.85;
  animation: none;
}

.send-btn:disabled {
  cursor: default;
  opacity: 0.5;
}

.input-hint {
  margin: 8px 0 0;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-align: center;
  line-height: 1.4;
}
</style>
