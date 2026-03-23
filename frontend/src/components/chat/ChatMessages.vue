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
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="56" height="56" rx="14" fill="url(#logo-gradient)"/>
          <path d="M18 20h20M18 28h14M18 36h18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="40" cy="36" r="4" fill="white" opacity="0.8"/>
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop stop-color="#2563EB"/>
              <stop offset="1" stop-color="#60a5fa"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h2 class="empty-title">ChatBI</h2>
      <p class="empty-subtitle">使用自然语言，探索和分析你的数据</p>
    </div>
    <div v-else class="messages-wrapper">
      <!-- Virtual scroll for large message lists -->
      <div v-if="useVirtualScroll" class="messages-list messages-list--virtual" ref="virtualContainerRef">
        <div :style="{ height: `${virtualTopPad}px` }" />
        <ChatMessage
          v-for="(message, i) in visibleMessages"
          :key="message.id"
          :message="message"
        />
        <div :style="{ height: `${virtualBottomPad}px` }" />
        <div v-if="isStreaming" class="streaming-indicator" role="status" aria-label="正在生成回复">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      <!-- Normal rendering for small lists -->
      <div v-else class="messages-list">
        <ChatMessage
          v-for="(message, index) in messages"
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
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import ChatMessage from './ChatMessage.vue'

const VIRTUAL_THRESHOLD = 50
const ESTIMATED_ITEM_HEIGHT = 120 // average message height in px
const BUFFER_SIZE = 10 // extra items above/below viewport

const chatStore = useChatStore()
const sessionStore = useSessionStore()

const messagesContainer = ref<HTMLElement | null>(null)
const virtualContainerRef = ref<HTMLElement | null>(null)

const messages = computed(() => chatStore.messages)
const isStreaming = computed(() => chatStore.isStreaming)
const hasMessages = computed(() => chatStore.hasMessages)
const useVirtualScroll = computed(() => messages.value.length > VIRTUAL_THRESHOLD)

// Virtual scroll state
const scrollTop = ref(0)
const containerHeight = ref(0)

const visibleRange = computed(() => {
  if (!useVirtualScroll.value) return { start: 0, end: messages.value.length }
  const totalItems = messages.value.length
  const start = Math.max(0, Math.floor(scrollTop.value / ESTIMATED_ITEM_HEIGHT) - BUFFER_SIZE)
  const visibleCount = Math.ceil(containerHeight.value / ESTIMATED_ITEM_HEIGHT) + BUFFER_SIZE * 2
  const end = Math.min(totalItems, start + visibleCount)
  return { start, end }
})

const visibleMessages = computed(() => {
  const { start, end } = visibleRange.value
  return messages.value.slice(start, end)
})

const virtualTopPad = computed(() => visibleRange.value.start * ESTIMATED_ITEM_HEIGHT)
const virtualBottomPad = computed(() => {
  const remaining = messages.value.length - visibleRange.value.end
  return Math.max(0, remaining * ESTIMATED_ITEM_HEIGHT)
})

function onVirtualScroll() {
  if (virtualContainerRef.value) {
    scrollTop.value = virtualContainerRef.value.scrollTop
  }
}

// Hide avatar for consecutive messages from the same role
function shouldHideAvatar(index: number): boolean {
  if (index === 0) return false
  const prev = messages.value[index - 1]
  const curr = messages.value[index]
  return prev.role === curr.role
}

// For virtual scroll, compute based on absolute index
function shouldHideAvatarVirtual(visibleIndex: number): boolean {
  const absIndex = visibleRange.value.start + visibleIndex
  if (absIndex === 0) return false
  const prev = messages.value[absIndex - 1]
  const curr = messages.value[absIndex]
  return prev.role === curr.role
}

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// Streaming 过程中内容持续增长，监听最后一条消息的内容和事件变化
watch(
  () => {
    const last = messages.value[messages.value.length - 1]
    if (!last) return ''
    return `${last.content?.length || 0}-${last.events?.length || 0}`
  },
  async () => {
    if (isStreaming.value) {
      await nextTick()
      scrollToBottom()
    }
  }
)

watch(isStreaming, async () => {
  if (isStreaming.value) {
    await nextTick()
    scrollToBottom()
  }
})

function scrollToBottom() {
  const container = useVirtualScroll.value ? virtualContainerRef.value : messagesContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

onMounted(() => {
  if (virtualContainerRef.value) {
    containerHeight.value = virtualContainerRef.value.clientHeight
    virtualContainerRef.value.addEventListener('scroll', onVirtualScroll, { passive: true })
  }
})

onUnmounted(() => {
  virtualContainerRef.value?.removeEventListener('scroll', onVirtualScroll)
})

// Re-attach listener when switching to virtual mode
watch(useVirtualScroll, async (val) => {
  if (val) {
    await nextTick()
    if (virtualContainerRef.value) {
      containerHeight.value = virtualContainerRef.value.clientHeight
      virtualContainerRef.value.addEventListener('scroll', onVirtualScroll, { passive: true })
      scrollToBottom()
    }
  }
})
</script>

<style scoped>
.chat-messages {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  scroll-behavior: smooth;
  min-height: 0;
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
  margin-bottom: 12px;
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

/* Messages area */
.messages-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 0;
  scroll-behavior: smooth;
}

.messages-list {
  display: flex;
  flex-direction: column;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px 24px;
}

.messages-list--virtual {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
}

@media (max-width: 767px) {
  .messages-list {
    padding: 0 12px 16px;
  }
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
