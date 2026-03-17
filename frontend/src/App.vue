<template>
  <div class="app-layout">
    <AppSidebar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'

const sessionStore = useSessionStore()
const chatStore = useChatStore()
const route = useRoute()

onMounted(async () => {
  await sessionStore.loadSessions()

  // 如果 URL 带 sessionId，加载该会话
  const sessionId = route.params.sessionId as string
  if (sessionId) {
    sessionStore.selectSession(sessionId)
    await chatStore.loadSession(sessionId)
  }
})

// 路由变化时切换会话（仅当 sessionId 真正变化时）
watch(
  () => route.params.sessionId,
  (newId, oldId) => {
    if (newId && typeof newId === 'string' && newId !== oldId) {
      sessionStore.selectSession(newId)
      chatStore.loadSession(newId)
    }
  }
)
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}
</style>
