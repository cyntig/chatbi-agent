/**
 * Mock BFF Server for Frontend Testing
 * This simulates the backend API responses before the actual BFF layer is implemented
 */

import express from 'express'
import cors from 'cors'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const PORT = 8001

// Middleware
app.use(cors())
app.use(express.json())

// In-memory storage
const sessions = new Map()
const messages = new Map()

// Helper function to create stream events
function createStreamEvent(type, data) {
  return {
    type,
    data,
    timestamp: new Date().toISOString()
  }
}

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Session management
app.get('/api/sessions', (req, res) => {
  const sessionList = Array.from(sessions.values()).sort((a, b) =>
    new Date(b.updatedAt) - new Date(a.updatedAt)
  )
  res.json({ sessions: sessionList })
})

app.post('/api/sessions', (req, res) => {
  const session = {
    id: uuidv4(),
    title: req.body.title || 'New Chat',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messageCount: 0,
    lastMessage: '',
    metadata: {}
  }
  sessions.set(session.id, session)
  res.json(session)
})

app.get('/api/sessions/:sessionId', (req, res) => {
  const session = sessions.get(req.params.sessionId)
  if (!session) {
    return res.status(404).json({ error: 'Session not found' })
  }
  res.json(session)
})

app.delete('/api/sessions/:sessionId', (req, res) => {
  if (!sessions.has(req.params.sessionId)) {
    return res.status(404).json({ error: 'Session not found' })
  }
  sessions.delete(req.params.sessionId)
  messages.delete(req.params.sessionId)
  res.json({ success: true })
})

// Chat streaming endpoint
app.post('/api/chat/stream', async (req, res) => {
  const { message, sessionId } = req.body

  // Create session if not exists
  if (!sessions.has(sessionId)) {
    const session = {
      id: sessionId,
      title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      lastMessage: message,
      metadata: {}
    }
    sessions.set(sessionId, session)
  }

  // Update session
  const session = sessions.get(sessionId)
  session.messageCount++
  session.lastMessage = message
  session.updatedAt = new Date().toISOString()

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Simulate streaming response
  const response = `I understand you're asking about: "${message}". This is a mock response from the BFF server. The actual implementation will connect to the ChatBI MCP server for real data analysis and SQL generation.`

  const words = response.split(' ')

  // Send content chunks
  for (let i = 0; i < words.length; i++) {
    const event = createStreamEvent('content', {
      content: words[i] + ' '
    })
    res.write(`data: ${JSON.stringify(event)}\n\n`)
    await new Promise(resolve => setTimeout(resolve, 50)) // Simulate typing delay
  }

  // Send tool execution event
  const toolEvent = createStreamEvent('tool', {
    id: uuidv4(),
    name: 'generate_and_execute_sql',
    status: 'running',
    arguments: {
      question: message,
      schema: 'public',
      table: 'users'
    }
  })
  res.write(`data: ${JSON.stringify(toolEvent)}\n\n`)

  await new Promise(resolve => setTimeout(resolve, 1000))

  // Send tool completion
  const toolCompleteEvent = createStreamEvent('tool', {
    id: toolEvent.data.id,
    name: 'generate_and_execute_sql',
    status: 'completed',
    result: {
      columns: ['id', 'name', 'email', 'created_at'],
      rows: [
        [1, 'John Doe', 'john@example.com', '2024-01-01'],
        [2, 'Jane Smith', 'jane@example.com', '2024-01-02']
      ],
      title: 'Query Results'
    }
  })
  res.write(`data: ${JSON.stringify(toolCompleteEvent)}\n\n`)

  // Send chart event
  const chartEvent = createStreamEvent('chart', {
    id: uuidv4(),
    type: 'bar',
    title: 'User Distribution',
    data: {
      columns: ['Month', 'Users'],
      rows: [
        ['Jan', 150],
        ['Feb', 200],
        ['Mar', 180]
      ]
    }
  })
  res.write(`data: ${JSON.stringify(chartEvent)}\n\n`)

  // Send done event
  const doneEvent = createStreamEvent('done', {
    sessionId: sessionId
  })
  res.write(`data: ${JSON.stringify(doneEvent)}\n\n`)

  res.end()
})

// Messages endpoint
app.get('/api/sessions/:sessionId/messages', (req, res) => {
  const sessionMessages = messages.get(req.params.sessionId) || []
  res.json({ messages: sessionMessages })
})

// Export endpoint
app.post('/api/export/:format', (req, res) => {
  const { format } = req.params
  const { data, filename } = req.body

  // Simulate export processing
  res.json({
    success: true,
    url: `/downloads/${filename}.${format}`,
    format: format
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`Mock BFF Server running on http://localhost:${PORT}`)
  console.log('Health check: http://localhost:8001/health')
  console.log('API endpoints:')
  console.log('  - GET  /api/sessions')
  console.log('  - POST /api/sessions')
  console.log('  - GET  /api/sessions/:id')
  console.log('  - DELETE /api/sessions/:id')
  console.log('  - POST /api/chat/stream')
  console.log('  - POST /api/export/:format')
})