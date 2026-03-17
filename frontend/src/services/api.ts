/**
 * HTTP API 客户端
 */

import type { Session, SessionDetail } from '@/types'

const BASE = ''  // 通过 vite proxy 转发

export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${BASE}/api/sessions`)
  if (!res.ok) throw new Error('Failed to fetch sessions')
  const data = await res.json()
  return data.map((s: any) => ({
    sessionId: s.session_id,
    title: s.title,
    updatedAt: s.updated_at,
    messageCount: s.message_count,
  }))
}

export async function fetchSessionDetail(sessionId: string): Promise<SessionDetail> {
  const res = await fetch(`${BASE}/api/sessions/${sessionId}`)
  if (!res.ok) throw new Error('Session not found')
  const data = await res.json()
  return {
    sessionId: data.session_id,
    title: data.title,
    updatedAt: data.updated_at,
    messages: data.messages,
  }
}

export async function createSession(title = '新对话'): Promise<Session> {
  const res = await fetch(`${BASE}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to create session')
  const data = await res.json()
  return {
    sessionId: data.session_id,
    title: data.title,
    updatedAt: data.updated_at,
    messageCount: data.message_count,
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${BASE}/api/sessions/${sessionId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete session')
}

export async function renameSession(sessionId: string, title: string): Promise<void> {
  const res = await fetch(`${BASE}/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })
  if (!res.ok) throw new Error('Failed to rename session')
}
