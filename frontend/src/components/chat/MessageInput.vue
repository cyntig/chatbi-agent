<template>
  <div class="message-input-wrapper">
    <div class="input-container">
      <textarea
        ref="textareaRef"
        v-model="inputText"
        :placeholder="chatStore.isStreaming ? 'AI 正在回答中...' : '输入你的问题...'"
        :disabled="chatStore.isStreaming"
        rows="1"
        @input="autoResize"
        @keydown="handleKeydown"
      />
      <button
        v-if="chatStore.isStreaming"
        class="stop-btn"
        @click="chatStore.stopStreaming()"
        title="停止生成"
      >
        <span class="stop-icon">&#9632;</span>
      </button>
      <button
        v-else
        class="send-btn"
        :disabled="!inputText.trim()"
        @click="handleSend"
        title="发送"
      >
        <span class="send-icon">&#10148;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { useRouter } from 'vue-router'

const chatStore = useChatStore()
const sessionStore = useSessionStore()
const router = useRouter()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = textareaRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || chatStore.isStreaming) return

  // 如果没有当前会话，先创建一个
  let sessionId = sessionStore.currentSessionId
  if (!sessionId) {
    sessionId = await sessionStore.createNewSession()
    router.push(`/chat/${sessionId}`)
  }

  inputText.value = ''
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  })

  await chatStore.sendMessage(sessionId, text)

  // 发送完成后刷新会话列表以更新标题
  sessionStore.loadSessions()
}
</script>

<style scoped>
.message-input-wrapper {
  padding: 12px 16px 24px;
  background: var(--bg-primary);
}

.input-container {
  max-width: var(--message-max-width);
  margin: 0 auto;
  position: relative;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-container:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px var(--accent-light);
}

textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: var(--text-primary);
  line-height: 1.5;
  max-height: var(--input-max-height);
  padding: 4px 0;
}

textarea::placeholder {
  color: var(--text-placeholder);
}

textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn,
.stop-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.send-btn {
  background: var(--accent);
  color: white;
}

.send-btn:disabled {
  background: var(--bg-user-msg);
  color: var(--text-placeholder);
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background: var(--accent-hover);
}

.send-icon {
  font-size: 16px;
}

.stop-btn {
  background: var(--danger);
  color: white;
}

.stop-btn:hover {
  background: var(--danger-hover);
}

.stop-icon {
  font-size: 12px;
}
</style>
