<template>
  <div class="chat-view">
    <ChatHeader />
    <ChatMessages />
    <ChatInput />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const route = useRoute()
const sessionStore = useSessionStore()
const chatStore = useChatStore()

const sessionId = route.params.sessionId as string

onMounted(async () => {
  // Load session if it's not 'new'
  if (sessionId !== 'new') {
    try {
      await sessionStore.loadSession(sessionId)
      // Load messages if available
      if (sessionStore.currentSession?.messages) {
        chatStore.setMessages(
          sessionStore.currentSession.messages.map((msg) => ({
            ...msg,
            id: `${Date.now()}-${Math.random()}`,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  } else {
    // Create new session
    try {
      const newSession = await sessionStore.createSession('新对话')
      // Navigate to new session
      // Note: We might want to update the route here
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }
})

// Watch for route changes
watch(
  () => route.params.sessionId,
  async (newSessionId) => {
    if (newSessionId && newSessionId !== 'new') {
      try {
        await sessionStore.loadSession(newSessionId as string)
        chatStore.clearMessages()
        if (sessionStore.currentSession?.messages) {
          chatStore.setMessages(
            sessionStore.currentSession.messages.map((msg) => ({
              ...msg,
              id: `${Date.now()}-${Math.random()}`,
            }))
          )
        }
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }
  }
)
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
