<template>
  <div class="message-list" ref="listRef">
    <div class="message-list-inner">
      <div v-if="chatStore.messages.length === 0" class="empty-state">
        <div class="empty-icon">&#128202;</div>
        <h2>ChatBI</h2>
        <p>输入你的数据分析问题，AI 将为你生成可视化报告</p>
      </div>
      <MessageItem
        v-for="msg in chatStore.messages"
        :key="msg.id"
        :message="msg"
      />
      <div v-if="chatStore.error" class="error-banner">
        {{ chatStore.error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import MessageItem from './MessageItem.vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()
const listRef = ref<HTMLElement | null>(null)
let userScrolledUp = false

function scrollToBottom() {
  if (listRef.value && !userScrolledUp) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

function handleScroll() {
  if (!listRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listRef.value
  // 距底部超过 100px 认为用户主动上翻
  userScrolledUp = scrollHeight - scrollTop - clientHeight > 100
}

onMounted(() => {
  listRef.value?.addEventListener('scroll', handleScroll)
})

// 消息变化时自动滚动
watch(
  () => chatStore.messages.length,
  () => {
    userScrolledUp = false
    nextTick(scrollToBottom)
  }
)

// 流式内容更新时持续滚动
watch(
  () => {
    const msgs = chatStore.messages
    const last = msgs[msgs.length - 1]
    if (!last) return 0
    // 计算所有 parts 的总内容长度作为变化检测依据
    let len = last.parts.length
    for (const p of last.parts) {
      if (p.type === 'text') len += p.content.length
    }
    return len
  },
  () => nextTick(scrollToBottom)
)
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
}

.message-list-inner {
  max-width: var(--message-max-width);
  margin: 0 auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
  text-align: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  font-size: var(--font-size-base);
  max-width: 400px;
}

.error-banner {
  background: #fef2f2;
  color: var(--danger);
  padding: 10px 16px;
  border-radius: var(--radius-md);
  margin-top: 12px;
  font-size: var(--font-size-sm);
}
</style>
