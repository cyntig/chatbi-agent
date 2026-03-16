// Chat state management

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ToolCall, StreamEvent } from '@/types'

// Simple UUID generator
function generateId(): string {
  return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export const useChatStore = defineStore('chat', () => {
  // State
  const messages = ref<Message[]>([])
  const isStreaming = ref(false)
  const currentTool = ref<ToolCall | null>(null)
  const currentSessionId = ref<string>('')
  const streamingContent = ref<string>('')

  // Computed
  const lastMessage = computed(() => {
    return messages.value[messages.value.length - 1] || null
  })

  const messagesBySession = computed(() => {
    return (sessionId: string) => {
      return messages.value.filter((msg) => msg.sessionId === sessionId)
    }
  })

  const hasMessages = computed(() => {
    return messages.value.length > 0
  })

  // Actions
  function addMessage(message: Message) {
    messages.value.push(message)
  }

  function updateMessage(messageId: string, updates: Partial<Message>) {
    const index = messages.value.findIndex((msg) => msg.id === messageId)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
    }
  }

  function deleteMessage(messageId: string) {
    const index = messages.value.findIndex((msg) => msg.id === messageId)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function setStreaming(streaming: boolean) {
    isStreaming.value = streaming
  }

  function setCurrentTool(tool: ToolCall | null) {
    currentTool.value = tool
  }

  function updateStreamingContent(content: string) {
    streamingContent.value = content
  }

  function appendStreamingContent(content: string) {
    streamingContent.value += content
  }

  function clearStreamingContent() {
    streamingContent.value = ''
  }

  function setCurrentSession(sessionId: string) {
    currentSessionId.value = sessionId
  }

  function handleStreamEvent(event: StreamEvent) {
    switch (event.type) {
      case 'content':
        appendStreamingContent(event.data.content || '')
        break

      case 'tool':
        setCurrentTool({
          id: event.data.id || generateId(),
          name: event.data.name,
          status: event.data.status || 'running',
          arguments: event.data.arguments || {},
          result: event.data.result,
          error: event.data.error,
        })
        break

      case 'chart':
        if (lastMessage.value) {
          updateMessage(lastMessage.value.id, {
            metadata: {
              ...lastMessage.value.metadata,
              charts: [...(lastMessage.value.metadata?.charts || []), event.data],
            },
          })
        }
        break

      case 'table':
        if (lastMessage.value) {
          updateMessage(lastMessage.value.id, {
            metadata: {
              ...lastMessage.value.metadata,
              tables: [...(lastMessage.value.metadata?.tables || []), event.data],
            },
          })
        }
        break

      case 'error':
        console.error('Stream error:', event.data)
        break

      case 'done':
        // Finalize the streaming message
        if (streamingContent.value) {
          const message: Message = {
            id: generateId(),
            role: 'assistant',
            content: streamingContent.value,
            timestamp: new Date(),
            sessionId: currentSessionId.value,
          }
          addMessage(message)
          clearStreamingContent()
        }
        setStreaming(false)
        break
    }
  }

  function getMessagesBySession(sessionId: string) {
    return messages.value.filter((msg) => msg.sessionId === sessionId)
  }

  return {
    // State
    messages,
    isStreaming,
    currentTool,
    currentSessionId,
    streamingContent,

    // Computed
    lastMessage,
    messagesBySession,
    hasMessages,

    // Actions
    addMessage,
    updateMessage,
    deleteMessage,
    clearMessages,
    setStreaming,
    setCurrentTool,
    updateStreamingContent,
    appendStreamingContent,
    clearStreamingContent,
    setCurrentSession,
    handleStreamEvent,
    getMessagesBySession,
  }
})
