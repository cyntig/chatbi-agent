// Streaming response service

import { chatService } from './chatService'
import type { ChatRequest, StreamEvent } from '@/types'
import { CHAT_CONFIG } from '@/utils/constants'

export class StreamService {
  private activeController: AbortController | null = null
  private retryCount = 0

  /**
   * Stream chat response
   */
  async streamChat(
    request: ChatRequest,
    onEvent: (event: StreamEvent) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    this.activeController = new AbortController()
    this.retryCount = 0

    try {
      for await (const event of chatService.streamEvents(request)) {
        onEvent(event)

        if (event.type === 'done') {
          onComplete()
          break
        }

        if (event.type === 'error') {
          onError(new Error(event.data.message || 'Unknown error'))
          break
        }
      }
    } catch (error) {
      if (this.shouldRetry(error)) {
        await this.retry(request, onEvent, onComplete, onError)
      } else {
        onError(error as Error)
      }
    } finally {
      this.activeController = null
    }
  }

  /**
   * Retry failed stream request
   */
  private async retry(
    request: ChatRequest,
    onEvent: (event: StreamEvent) => void,
    onComplete: () => void,
    onError: (error: Error) => void
  ): Promise<void> {
    if (this.retryCount >= CHAT_CONFIG.retryAttempts) {
      onError(new Error('Maximum retry attempts reached'))
      return
    }

    this.retryCount++
    await new Promise(resolve => setTimeout(resolve, CHAT_CONFIG.retryDelay * this.retryCount))

    return this.streamChat(request, onEvent, onComplete, onError)
  }

  /**
   * Check if error should trigger retry
   */
  private shouldRetry(error: any): boolean {
    // Retry on network errors or server errors (5xx)
    return (
      error.name === 'TypeError' || // Network error
      (error.response && error.response.status >= 500) ||
      error.code === 'ECONNRESET'
    )
  }

  /**
   * Cancel active stream
   */
  cancel(): void {
    if (this.activeController) {
      this.activeController.abort()
      this.activeController = null
    }
  }

  /**
   * Check if stream is active
   */
  isActive(): boolean {
    return this.activeController !== null
  }
}

export const streamService = new StreamService()
