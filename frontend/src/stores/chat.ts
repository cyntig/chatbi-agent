/**
 * Chat Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chatAPI } from '@/api/chat'
import type { ChatMessage } from '@/types/chat'
import type { Event, ToolCall } from '@/types/api'

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  const currentSessionId = ref<string | null>(null)
  let abortFn: (() => void) | null = null

  /**
   * Generate unique ID for message
   */
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add user message
   */
  function addUserMessage(content: string): ChatMessage {
    const message: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    messages.value.push(message)
    return message
  }

  /**
   * Add assistant message placeholder
   */
  function addAssistantMessage(): ChatMessage {
    const message: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      toolCalls: [],
      isStreaming: true,
      events: [], // 初始化事件数组
    }
    messages.value.push(message)
    return message
  }

  /**
   * Update message content
   */
  function updateMessageContent(messageId: string, content: string): void {
    const message = messages.value.find((m) => m.id === messageId)
    if (message) {
      message.content += content
    }
  }

  /**
   * Add tool call to message
   */
  function addToolCall(messageId: string, toolCall: ToolCall): void {
    const message = messages.value.find((m) => m.id === messageId)
    if (message && message.toolCalls) {
      message.toolCalls.push(toolCall)
    }
  }

  /**
   * Mark message as complete
   */
  function markMessageComplete(messageId: string): void {
    const message = messages.value.find((m) => m.id === messageId)
    if (message) {
      message.isStreaming = false
    }
  }

  /**
   * Process SSE event
   */
  function processEvent(messageId: string, event: Event): void {
    const message = messages.value.find((m) => m.id === messageId)
    if (!message) return

    if (event.type === 'text' && event.content) {
      // 添加文本事件到事件数组
      if (message.events) {
        message.events.push({ type: 'text', content: event.content })
      }
      // 同时更新 content 字段（保持兼容性）
      message.content += event.content
    } else if (event.type === 'tool' && event.tool_call) {
      // 添加工具事件到事件数组
      if (message.events) {
        message.events.push({ type: 'tool', toolCall: event.tool_call })
      }
      // 同时更新 toolCalls 字段（保持兼容性）
      if (message.toolCalls) {
        message.toolCalls.push(event.tool_call)
      }
    } else if (event.type === 'end') {
      markMessageComplete(messageId)
    } else if (event.type === 'error') {
      error.value = event.error || 'An error occurred'
      markMessageComplete(messageId)
    }
  }

  /**
   * Send a message and start streaming
   */
  async function sendMessage(sessionId: string, content: string): Promise<void> {
    // Clear any existing connection
    if (abortFn) {
      abortFn()
      abortFn = null
    }

    isStreaming.value = true
    error.value = null
    currentSessionId.value = sessionId

    // Add user message
    addUserMessage(content)

    // Add assistant message placeholder
    const assistantMessage = addAssistantMessage()
    const assistantMessageId = assistantMessage.id

    try {
      // Start SSE connection
      abortFn = await chatAPI.sendMessage(sessionId, content, {
        onMessage: (event: Event) => {
          processEvent(assistantMessageId, event)
        },
        onError: (err: Error) => {
          error.value = err.message
          markMessageComplete(assistantMessageId)
        },
        onComplete: () => {
          markMessageComplete(assistantMessageId)
          isStreaming.value = false
          abortFn = null
        },
      })
    } catch (err: any) {
      error.value = err.message || 'Failed to send message'
      isStreaming.value = false
      markMessageComplete(assistantMessageId)
    }
  }

  /**
   * Stop streaming
   */
  function stopStreaming(): void {
    if (abortFn) {
      abortFn()
      abortFn = null
    }
    isStreaming.value = false
  }

  /**
   * Clear messages for current session
   */
  function clearMessages(): void {
    messages.value = []
    error.value = null
  }

  /**
   * Set messages (useful for loading session history)
   */
  function setMessages(newMessages: ChatMessage[]): void {
    messages.value = newMessages
  }

  // Computed properties
  const messageCount = computed(() => messages.value.length)
  const hasMessages = computed(() => messages.value.length > 0)

  return {
    messages,
    isStreaming,
    error,
    currentSessionId,
    messageCount,
    hasMessages,
    sendMessage,
    stopStreaming,
    clearMessages,
    setMessages,
  }
})
