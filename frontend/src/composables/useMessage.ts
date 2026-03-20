/**
 * Message Composable
 */

import { ref, computed } from 'vue'
import type { ChatMessage } from '@/types/chat'
import type { Event, ToolCall } from '@/types/api'

export function useMessage() {
  const messages = ref<ChatMessage[]>([])

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
    if (event.type === 'text' && event.content) {
      updateMessageContent(messageId, event.content)
    } else if (event.type === 'tool' && event.tool_call) {
      addToolCall(messageId, event.tool_call)
    } else if (event.type === 'end') {
      markMessageComplete(messageId)
    }
  }

  /**
   * Clear all messages
   */
  function clearMessages(): void {
    messages.value = []
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
    messageCount,
    hasMessages,
    addUserMessage,
    addAssistantMessage,
    updateMessageContent,
    addToolCall,
    markMessageComplete,
    processEvent,
    clearMessages,
    setMessages,
  }
}
