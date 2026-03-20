/**
 * Chat Composable
 * Main chat logic that combines message handling and SSE streaming
 */

import { ref } from 'vue'
import { useSSE } from './useSSE'
import { useMessage } from './useMessage'
import type { Event } from '@/types/api'

export function useChat() {
  const { events, isStreaming, error, connect, abort, reset: resetSSE } = useSSE()
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    processEvent,
    clearMessages,
  } = useMessage()

  const currentAssistantMessageId = ref<string | null>(null)

  /**
   * Send a message and start streaming
   */
  async function sendMessage(sessionId: string, content: string): Promise<void> {
    // Reset any existing connection
    resetSSE()

    // Add user message
    addUserMessage(content)

    // Add assistant message placeholder
    const assistantMessage = addAssistantMessage()
    currentAssistantMessageId.value = assistantMessage.id

    // Start SSE connection
    await connect(sessionId, content)

    // Process events as they arrive
    for (const event of events.value) {
      if (currentAssistantMessageId.value) {
        processEvent(currentAssistantMessageId.value, event)
      }
    }
  }

  /**
   * Stop streaming
   */
  function stopStreaming(): void {
    abort()
    if (currentAssistantMessageId.value) {
      processEvent(currentAssistantMessageId.value, { type: 'end' })
    }
    currentAssistantMessageId.value = null
  }

  /**
   * Clear chat
   */
  function clearChat(): void {
    abort()
    clearMessages()
    currentAssistantMessageId.value = null
  }

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stopStreaming,
    clearChat,
  }
}
