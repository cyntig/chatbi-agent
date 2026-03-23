<template>
  <div class="chat-view" id="main-content">
    <ChatHeader />
    <ChatMessages />
    <ChatInput />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import type { ChatMessage, MessageEvent } from '@/types/chat'
import type { ToolCall } from '@/types/api'
import ChatHeader from '@/components/chat/ChatHeader.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import ChatInput from '@/components/chat/ChatInput.vue'

const route = useRoute()
const sessionStore = useSessionStore()
const chatStore = useChatStore()

const sessionId = route.params.sessionId as string

/**
 * 将后端 OpenAI 格式的消息列表转换为前端 ChatMessage 格式
 *
 * 后端格式（多条消息表示一轮对话）:
 *   - assistant: { role, content, tool_calls: [{ function: { name, arguments }, id }] }
 *   - tool:      { role: "tool", tool_call_id, content }
 *   - assistant: { role, content }  （工具调用后的后续回复）
 *
 * 前端格式（合并为一条消息）:
 *   - user:      { role, content, id }
 *   - assistant: { role, content, id, toolCalls: [...], events: [...] }
 *
 * 合并规则：连续的 assistant/tool 消息（中间没有 user）合并为一条 assistant 消息
 */
function convertBackendMessages(backendMessages: any[]): ChatMessage[] {
  // 第一遍：收集 tool 响应，按 tool_call_id 索引
  const toolOutputMap: Record<string, string> = {}
  for (const msg of backendMessages) {
    if (msg.role === 'tool' && msg.tool_call_id) {
      toolOutputMap[msg.tool_call_id] = msg.content || ''
    }
  }

  const result: ChatMessage[] = []
  // 当前正在合并的 assistant 消息
  let currentAssistant: ChatMessage | null = null

  function flushAssistant() {
    if (currentAssistant) {
      result.push(currentAssistant)
      currentAssistant = null
    }
  }

  for (const msg of backendMessages) {
    // 跳过 system 和 tool 消息（tool 已通过 toolOutputMap 合并）
    if (msg.role === 'system') continue
    if (msg.role === 'tool') continue

    if (msg.role === 'user') {
      flushAssistant()
      result.push({
        id: `${Date.now()}-${Math.random()}`,
        role: 'user',
        content: msg.content || '',
        timestamp: msg.timestamp || new Date().toISOString(),
      })
    } else if (msg.role === 'assistant') {
      // 如果还没有当前 assistant 消息，创建一个
      if (!currentAssistant) {
        currentAssistant = {
          id: `${Date.now()}-${Math.random()}`,
          role: 'assistant',
          content: '',
          timestamp: msg.timestamp || new Date().toISOString(),
          toolCalls: [],
          events: [],
          isStreaming: false,
        }
      }

      // 追加文本内容
      if (msg.content) {
        currentAssistant.content += (currentAssistant.content ? '\n\n' : '') + msg.content
        currentAssistant.events!.push({ type: 'text', content: msg.content })
      }

      // 转换 tool_calls（后端 OpenAI 格式 -> 前端格式）
      if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
        for (const tc of msg.tool_calls) {
          const name = tc.function?.name || tc.name || ''
          const args = tc.function?.arguments || tc.arguments || ''
          const output = toolOutputMap[tc.id] || ''

          const toolCall: ToolCall = { name, arguments: args, output }
          currentAssistant.toolCalls!.push(toolCall)
          currentAssistant.events!.push({ type: 'tool', toolCall })
        }
      }
    }
  }

  flushAssistant()
  return result
}

async function loadAndSetMessages(sid: string) {
  await sessionStore.loadSession(sid)
  if (sessionStore.currentSession?.messages) {
    chatStore.setMessages(
      convertBackendMessages(sessionStore.currentSession.messages)
    )
  }
}

onMounted(async () => {
  if (sessionId !== 'new') {
    try {
      await loadAndSetMessages(sessionId)
    } catch (error) {
      console.error('Failed to load session:', error)
    }
  } else {
    try {
      const newSession = await sessionStore.createSession('新对话')
    } catch (error) {
      console.error('Failed to create session:', error)
    }
  }
})

watch(
  () => route.params.sessionId,
  async (newSessionId) => {
    if (newSessionId && newSessionId !== 'new') {
      try {
        chatStore.clearMessages()
        await loadAndSetMessages(newSessionId as string)
      } catch (error) {
        console.error('Failed to load session:', error)
      }
    }
  }
)
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-primary);
}
</style>
