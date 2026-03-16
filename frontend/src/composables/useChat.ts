// Chat composable for chat logic

import { ref, computed, readonly } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useSessionStore } from '@/stores/session'
import { useStreaming } from './useStreaming'
import type { Message } from '@/types'

export function useChat() {
  const chatStore = useChatStore()
  const sessionStore = useSessionStore()
  const { streamChat, isStreaming } = useStreaming()

  const error = ref<string | null>(null)
  const isSending = ref(false)

  /**
   * Send a message
   */
  async function sendMessage(content: string, sessionId?: string) {
    if (!content.trim()) {
      return
    }

    error.value = null
    isSending.value = true

    try {
      // Use current session or create new one
      let currentSessionId = sessionId || sessionStore.currentSessionId
      if (!currentSessionId) {
        const newSession = sessionStore.createSession()
        currentSessionId = newSession.id
        sessionStore.switchSession(currentSessionId)
      }

      // Create user message
      const userMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
        sessionId: currentSessionId,
      }

      chatStore.addMessage(userMessage)
      chatStore.setCurrentSession(currentSessionId)

      // Update session metadata
      sessionStore.incrementMessageCount(currentSessionId)
      sessionStore.updateLastMessage(currentSessionId, content)

      // Stream assistant response
      await streamChat(content, currentSessionId)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to send message'
      console.error('Error sending message:', err)
    } finally {
      isSending.value = false
    }
  }

  /**
   * Clear current chat
   */
  function clearChat() {
    chatStore.clearMessages()
    chatStore.clearStreamingContent()
  }

  /**
   * Retry last message
   */
  async function retryLastMessage() {
    const messages = chatStore.messages
    if (messages.length < 2) return

    // Get last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user')

    if (lastUserMessage) {
      // Remove the last assistant message if exists
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        chatStore.deleteMessage(lastMessage.id)
      }

      // Resend the user message
      await sendMessage(lastUserMessage.content, lastUserMessage.sessionId)
    }
  }

  /**
   * Regenerate response
   */
  async function regenerateResponse() {
    const messages = chatStore.messages
    if (messages.length === 0) return

    // Get last user message
    const lastUserMessage = [...messages]
      .reverse()
      .find(msg => msg.role === 'user')

    if (lastUserMessage) {
      // Remove the last assistant message if exists
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        chatStore.deleteMessage(lastMessage.id)
      }

      // Stream new response
      await streamChat(lastUserMessage.content, lastUserMessage.sessionId)
    }
  }

  return {
    // State
    error: readonly(error),
    isSending: readonly(isSending),
    isStreaming,

    // Actions
    sendMessage,
    clearChat,
    retryLastMessage,
    regenerateResponse,

    // Store access
    messages: computed(() => chatStore.messages),
    currentSession: computed(() => sessionStore.currentSession),
  }
}
