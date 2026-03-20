/**
 * Chat API - SSE Streaming
 */

import type { Event } from '@/types/api'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface SSEOptions {
  onMessage: (event: Event) => void
  onError: (error: Error) => void
  onComplete: () => void
}

export class ChatAPI {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl
  }

  /**
   * Send a message and receive SSE stream
   */
  async sendMessage(
    sessionId: string,
    message: string,
    options: SSEOptions
  ): Promise<() => void> {
    const url = new URL(`${this.baseUrl}/api/chatbi/chat`)
    url.searchParams.append('session_id', sessionId)
    url.searchParams.append('message', message)

    const abortController = new AbortController()
    let buffer = '' // Buffer to handle incomplete chunks

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        signal: abortController.signal,
        headers: {
          'Accept': 'text/event-stream',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is null')
      }

      // Read the stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Process any remaining data in buffer
          if (buffer.trim()) {
            this.processSSELine(buffer, options)
          }
          options.onComplete()
          break
        }

        // Add new chunk to buffer and decode
        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages (separated by double newlines)
        const messages = buffer.split('\n\n')
        buffer = messages.pop() || '' // Keep the last incomplete message in buffer

        for (const message of messages) {
          if (message.trim()) {
            this.processSSEMessage(message, options)
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        options.onError(error)
      }
    }

    return () => abortController.abort()
  }

  /**
   * Process a single SSE message
   */
  private processSSEMessage(message: string, options: SSEOptions): void {
    const lines = message.split('\n')
    for (const line of lines) {
      this.processSSELine(line, options)
    }
  }

  /**
   * Process a single SSE line
   */
  private processSSELine(line: string, options: SSEOptions): void {
    if (line.startsWith('data: ')) {
      try {
        const jsonStr = line.slice(6).trim()
        if (jsonStr) {
          const event: Event = JSON.parse(jsonStr)
          options.onMessage(event)

          if (event.type === 'end') {
            options.onComplete()
          }
        }
      } catch (e) {
        console.error('Failed to parse SSE data:', line, e)
      }
    }
  }

  /**
   * Abort a streaming request
   */
  abortRequest(abortFn: () => void): void {
    abortFn()
  }
}

export const chatAPI = new ChatAPI()
