// Chat service for managing chat interactions

import { requestClient } from './api'
import type { ChatRequest, Message, StreamEvent } from '@/types'
import { API_ENDPOINTS } from '@/utils/constants'

export class ChatService {
  /**
   * Send a chat message and receive streaming response
   */
  async sendMessage(request: ChatRequest): Promise<ReadableStream> {
    return await requestClient.stream(API_ENDPOINTS.chat.stream, request)
  }

  /**
   * Get chat history for a session
   */
  async getChatHistory(sessionId: string): Promise<Message[]> {
    const response = await requestClient.get<Message[]>(
      `${API_ENDPOINTS.chat.history}?session_id=${sessionId}`
    )
    return response.data || []
  }

  /**
   * Process stream events
   */
  async *streamEvents(request: ChatRequest): AsyncGenerator<StreamEvent> {
    const stream = await this.sendMessage(request)
    const reader = stream.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6))
              yield event
            } catch (error) {
              console.error('Error parsing stream event:', error)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }
}

export const chatService = new ChatService()
