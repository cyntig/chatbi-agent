/**
 * SSE 流式连接 composable
 * 使用 fetch + ReadableStream 实现 POST SSE（因为 EventSource 仅支持 GET）
 */

import type { SSEContentEvent, SSEToolEndEvent, SSEDoneEvent, SSEErrorEvent } from '@/types'

export interface SSEHandlers {
  onContent: (data: SSEContentEvent) => void
  onToolEnd: (data: SSEToolEndEvent) => void
  onDone: (data: SSEDoneEvent) => void
  onError: (data: SSEErrorEvent) => void
}

export function useSSE() {
  async function streamChat(
    sessionId: string,
    message: string,
    handlers: SSEHandlers,
    signal?: AbortSignal,
    model?: string,
  ) {
    const body: Record<string, string> = {
      session_id: sessionId,
      message,
    }
    if (model) body.model = model

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      handlers.onError({ message: `HTTP ${response.status}: ${response.statusText}` })
      return
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // 按 SSE 规范解析：事件由双换行分隔
      const parts = buffer.split('\n\n')
      buffer = parts.pop() || '' // 最后一段可能不完整，留在 buffer

      for (const part of parts) {
        if (!part.trim()) continue

        let eventType = 'message'
        let data = ''

        for (const line of part.split('\n')) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            data += line.slice(6)
          } else if (line.startsWith('data:')) {
            data += line.slice(5)
          }
        }

        if (!data) continue

        try {
          const parsed = JSON.parse(data)
          switch (eventType) {
            case 'content':
              handlers.onContent(parsed as SSEContentEvent)
              break
            case 'tool_end':
              handlers.onToolEnd(parsed as SSEToolEndEvent)
              break
            case 'done':
              handlers.onDone(parsed as SSEDoneEvent)
              break
            case 'error':
              handlers.onError(parsed as SSEErrorEvent)
              break
          }
        } catch (e) {
          console.warn('Failed to parse SSE data:', data, e)
        }
      }
    }
  }

  return { streamChat }
}
