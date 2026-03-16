// Streaming response composable

import { ref, computed, readonly } from 'vue'
import { useChatStore } from '@/stores/chat'
import { streamService } from '@/services/streamService'
import type { StreamEvent } from '@/types'

export function useStreaming() {
  const chatStore = useChatStore()
  const error = ref<string | null>(null)
  const isStreaming = ref(false)

  /**
   * Stream chat response
   */
  async function streamChat(message: string, sessionId: string) {
    if (isStreaming.value) {
      console.warn('Stream already in progress')
      return
    }

    isStreaming.value = true
    error.value = null
    chatStore.setStreaming(true)

    try {
      await streamService.streamChat(
        { message, sessionId },
        handleEvent,
        handleComplete,
        handleError
      )
    } catch (err) {
      handleError(err as Error)
    }
  }

  /**
   * Handle stream events
   */
  function handleEvent(event: StreamEvent) {
    chatStore.handleStreamEvent(event)
  }

  /**
   * Handle stream completion
   */
  function handleComplete() {
    isStreaming.value = false
    chatStore.setStreaming(false)
  }

  /**
   * Handle stream errors
   */
  function handleError(err: Error) {
    error.value = err.message
    isStreaming.value = false
    chatStore.setStreaming(false)

    console.error('Streaming error:', err)
  }

  /**
   * Cancel active stream
   */
  function cancelStream() {
    streamService.cancel()
    isStreaming.value = false
    chatStore.setStreaming(false)
  }

  return {
    // State
    error: readonly(error),
    isStreaming: readonly(isStreaming),

    // Actions
    streamChat,
    cancelStream,

    // Store access
    streamingContent: computed(() => chatStore.streamingContent),
    currentTool: computed(() => chatStore.currentTool),
  }
}
