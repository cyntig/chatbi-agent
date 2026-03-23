<template>
  <div
    class="chat-messages"
    ref="messagesContainer"
    role="log"
    aria-label="聊天消息"
    aria-live="polite"
  >
    <div v-if="!hasMessages" class="empty-state">
      <div class="empty-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="var(--accent-subtle)"/>
          <path d="M24 14v20M14 24h20" stroke="var(--accent-color)" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </div>
      <h2 class="empty-title">ChatBI</h2>
      <p class="empty-subtitle">开始对话，探索你的数据</p>
      <div class="empty-suggestions">
        <button class="suggestion-card" type="button">
          <span class="suggestion-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </span>
          <span class="suggestion-text">帮我分析销售数据趋势</span>
        </button>
        <button class="suggestion-card" type="button">
          <span class="suggestion-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </span>
          <span class="suggestion-text">查询上月营收报告</span>
        </button>
        <button class="suggestion-card" type="button">
          <span class="suggestion-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>
          <span class="suggestion-text">对比不同产品的表现</span>
        </button>
      </div>
    </div>
    <div v-else class="messages-wrapper">
      <div class="messages-list">
        <ChatMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
        />
        <div v-if="isStreaming" class="streaming-indicator" role="status" aria-label="正在生成回复">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import ChatMessage from './ChatMessage.vue'

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const messagesContainer = ref<HTMLElement | null>(null)

const messages = computed(() => chatStore.messages)
const isStreaming = computed(() => chatStore.isStreaming)
const hasMessages = computed(() => chatStore.hasMessages)

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

watch(isStreaming, async () => {
  if (isStreaming.value) {
    await nextTick()
    scrollToBottom()
  }
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 8px;
  text-align: center;
  padding: 32px 24px;
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
}

.empty-logo {
  margin-bottom: 8px;
}

.empty-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.empty-subtitle {
  margin: 0;
  font-size: 1rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.empty-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
  width: 100%;
  max-width: 400px;
}

.suggestion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: background-color var(--transition-fast) ease,
              border-color var(--transition-fast) ease,
              box-shadow var(--transition-fast) ease;
  font-size: 0.875rem;
  font-family: inherit;
  color: var(--text-primary);
  text-align: left;
  min-height: 48px; /* Touch target */
  width: 100%;
}

.suggestion-card:hover {
  background-color: var(--accent-subtle);
  border-color: var(--accent-color);
}

.suggestion-card:active {
  transform: scale(0.98);
}

.suggestion-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent-subtle);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.suggestion-text {
  flex: 1;
}

/* Messages area */
.messages-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.messages-list {
  display: flex;
  flex-direction: column;
  max-width: 768px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px 24px;
}

/* Streaming indicator */
.streaming-indicator {
  display: flex;
  padding: 24px 0 8px;
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background-color: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
