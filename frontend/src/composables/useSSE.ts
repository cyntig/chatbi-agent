/**
 * SSE Composable
 */

import { ref } from 'vue'
import { chatAPI } from '@/api/chat'
import type { Event } from '@/types/api'

export function useSSE() {
  const events = ref<Event[]>([])
  const isStreaming = ref(false)
  const error = ref<Error | null>(null)
  let abortFn: (() => void) | null = null

  /**
   * Connect to SSE stream
   */
  async function connect(sessionId: string, message: string): Promise<void> {
    isStreaming.value = true
    error.value = null
    events.value = []

    try {
      abortFn = await chatAPI.sendMessage(sessionId, message, {
        onMessage: (event: Event) => {
          events.value.push(event)
        },
        onError: (err: Error) => {
          error.value = err
        },
        onComplete: () => {
          isStreaming.value = false
        },
      })
    } catch (err: any) {
      error.value = err
      isStreaming.value = false
    }
  }

  /**
   * Abort the current connection
   */
  function abort(): void {
    if (abortFn) {
      abortFn()
      abortFn = null
    }
    isStreaming.value = false
  }

  /**
   * Reset state
   */
  function reset(): void {
    abort()
    events.value = []
    error.value = null
  }

  return {
    events,
    isStreaming,
    error,
    connect,
    abort,
    reset,
  }
}
