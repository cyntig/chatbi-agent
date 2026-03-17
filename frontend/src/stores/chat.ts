/**
 * Chat Store - 管理当前会话的聊天消息和流式状态
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage, MessagePart, RawMessage } from '@/types'
import { fetchSessionDetail } from '@/services/api'
import { useSSE } from '@/composables/useSSE'

let messageIdCounter = 0
function genId(): string {
  return `msg-${Date.now()}-${++messageIdCounter}`
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)

  let abortController: AbortController | null = null
  const { streamChat } = useSSE()

  /**
   * 从后端加载会话历史，将 OpenAI 格式消息还原为前端 ChatMessage
   * 如果正在流式响应中，跳过加载以避免清空正在填充的消息
   */
  async function loadSession(sessionId: string) {
    if (isStreaming.value) return

    messages.value = []
    error.value = null

    try {
      const detail = await fetchSessionDetail(sessionId)
      messages.value = reconstructMessages(detail.messages)
    } catch (e: any) {
      // 新会话可能没有历史
      if (e.message !== 'Session not found') {
        console.error('Failed to load session:', e)
      }
    }
  }

  /**
   * 将后端原始消息重建为前端 ChatMessage 列表
   * 后端 OpenAI 格式：assistant(content + tool_calls) → tool(result) → assistant(content + tool_calls) → ...
   * 前端按时序排列为 parts 数组
   */
  function reconstructMessages(rawMessages: RawMessage[]): ChatMessage[] {
    const result: ChatMessage[] = []
    // 当前正在构建的 assistant 消息（可能跨多轮 raw message 合并）
    let currentAssistant: ChatMessage | null = null
    // 未填充 output 的 toolCall 队列
    let pendingToolCalls: { toolCall: import('@/types').ToolCall }[] = []

    for (const raw of rawMessages) {
      if (raw.role === 'system') continue

      if (raw.role === 'user') {
        // 遇到 user 消息，结束之前的 assistant 合并
        currentAssistant = null
        pendingToolCalls = []
        result.push({
          id: genId(),
          role: 'user',
          parts: [{ type: 'text', content: raw.content || '' }],
          isStreaming: false,
          timestamp: Date.now(),
        })
      } else if (raw.role === 'assistant') {
        if (!currentAssistant) {
          // 第一个 assistant 消息，新建
          currentAssistant = {
            id: genId(),
            role: 'assistant',
            parts: [],
            isStreaming: false,
            timestamp: Date.now(),
          }
          result.push(currentAssistant)
        }

        // 先追加文本内容（如果有）
        if (raw.content) {
          currentAssistant.parts.push({ type: 'text', content: raw.content })
        }

        // 再追加 tool_calls（如果有）
        if (raw.tool_calls) {
          for (const tc of raw.tool_calls) {
            let args: any
            try {
              args = JSON.parse(tc.function.arguments)
            } catch {
              args = tc.function.arguments
            }
            const toolCall = {
              name: tc.function.name,
              arguments: args,
              output: null as any,
              isExpanded: false,
            }
            currentAssistant.parts.push({ type: 'tool', toolCall })
            pendingToolCalls.push({ toolCall })
          }
        }
      } else if (raw.role === 'tool') {
        // 工具结果附加到最早的未填充 output 的 toolCall
        const pending = pendingToolCalls.shift()
        if (pending) {
          try {
            pending.toolCall.output = JSON.parse(raw.content || '{}')
          } catch {
            pending.toolCall.output = raw.content
          }
        }
      }
    }

    return result
  }

  /**
   * 获取消息的最后一个 text part，没有则新建一个
   */
  function getOrCreateLastTextPart(msg: ChatMessage): MessagePart & { type: 'text' } {
    const lastPart = msg.parts[msg.parts.length - 1]
    if (lastPart && lastPart.type === 'text') {
      return lastPart
    }
    const newPart: MessagePart = { type: 'text', content: '' }
    msg.parts.push(newPart)
    return newPart as MessagePart & { type: 'text' }
  }

  /**
   * 发送消息并处理 SSE 流
   */
  async function sendMessage(sessionId: string, text: string) {
    if (isStreaming.value) return
    error.value = null

    // 添加用户消息
    messages.value.push({
      id: genId(),
      role: 'user',
      parts: [{ type: 'text', content: text }],
      isStreaming: false,
      timestamp: Date.now(),
    })

    // 添加空的 assistant 消息（流式填充）
    const assistantMsg: ChatMessage = {
      id: genId(),
      role: 'assistant',
      parts: [],
      isStreaming: true,
      timestamp: Date.now(),
    }
    messages.value.push(assistantMsg)

    // 通过 id 查找响应式代理引用，比索引更安全
    const assistantId = assistantMsg.id
    const reactiveMsg = () => messages.value.find(m => m.id === assistantId)!

    isStreaming.value = true
    abortController = new AbortController()

    try {
      await streamChat(
        sessionId,
        text,
        {
          onContent(data) {
            const msg = reactiveMsg()
            const textPart = getOrCreateLastTextPart(msg)
            textPart.content += data.text
          },
          onToolEnd(data) {
            const msg = reactiveMsg()
            msg.parts.push({
              type: 'tool',
              toolCall: {
                name: data.name,
                arguments: data.arguments,
                output: data.output,
                content: data.content,
                isExpanded: false,
              },
            })
          },
          onDone() {
            reactiveMsg().isStreaming = false
            isStreaming.value = false
            abortController = null
          },
          onError(data) {
            reactiveMsg().isStreaming = false
            isStreaming.value = false
            error.value = data.message
            abortController = null
          },
        },
        abortController.signal
      )
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        reactiveMsg().isStreaming = false
        isStreaming.value = false
        error.value = e.message || 'Unknown error'
      }
      abortController = null
    }
  }

  function stopStreaming() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    isStreaming.value = false
    // 标记最后一条 assistant 消息为完成
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.isStreaming = false
    }
  }

  function clearMessages() {
    messages.value = []
    error.value = null
  }

  return {
    messages,
    isStreaming,
    error,
    loadSession,
    sendMessage,
    stopStreaming,
    clearMessages,
  }
})
