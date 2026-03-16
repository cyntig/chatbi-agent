<!-- Message list component -->
<template>
  <div class="message-list" ref="scrollContainer">
    <div v-if="!hasMessages" class="message-list__empty">
      <div class="message-list__empty-content">
        <h3>欢迎使用 ChatBI Agent</h3>
        <p>开始您的数据探索之旅</p>
        <div class="message-list__suggestions">
          <n-button
            v-for="(suggestion, index) in suggestions"
            :key="index"
            text
            @click="handleSuggestionClick(suggestion)"
          >
            <template #icon>
              <n-icon><chatbubble-outline /></n-icon>
            </template>
            {{ suggestion }}
          </n-button>
        </div>
      </div>
    </div>

    <div v-else class="message-list__messages">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
        class="message-list__item"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { ChatbubbleOutline } from '@vicons/ionicons5'
import { useChatStore } from '@/stores/chat'
import { useChat } from '@/composables/useChat'
import MessageItem from './MessageItem.vue'

// Stores & Composables
const chatStore = useChatStore()
const { sendMessage } = useChat()

// Refs
const scrollContainer = ref<HTMLElement>()

// Data
const suggestions = [
  '显示最近的数据概览',
  '分析销售趋势',
  '查找异常数据',
  '生成可视化报表'
]

// Computed
const messages = computed(() => chatStore.messages)
const hasMessages = computed(() => chatStore.hasMessages)

// Methods
function handleSuggestionClick(suggestion: string) {
  sendMessage(suggestion)
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

// Watch for new messages and auto-scroll
watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

// Initial scroll
onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.message-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding: 0.5rem;
}

.message-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
}

.message-list__empty-content h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--n-text-color);
}

.message-list__empty-content p {
  color: var(--n-text-color-2);
  margin-bottom: 2rem;
}

.message-list__suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
}

.message-list__suggestions .n-button {
  width: 100%;
  max-width: 400px;
  justify-content: flex-start;
  padding: 0.75rem 1rem;
  border: 1px solid var(--n-border-color);
  border-radius: var(--n-border-radius);
  transition: all 0.2s;
}

.message-list__suggestions .n-button:hover {
  border-color: var(--n-primary-color);
  background: var(--n-primary-color-hover);
}

.message-list__messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-list__item {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>