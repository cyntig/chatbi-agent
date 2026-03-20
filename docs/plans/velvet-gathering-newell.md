# ChatBI 前端方案设计

## 📋 项目背景

ChatBI Agent 目前使用 Chainlit 作为前端界面，功能有限且缺乏定制化能力。本项目旨在构建一个基于 **Vue 3 + TypeScript** 的专业数据分析前端应用，提供更好的用户体验和丰富的交互功能。

---

## 🎯 核心目标

1. **替代 Chainlit UI**，提供专业级的数据分析界面
2. **支持多会话管理**，方便用户切换不同的分析任务
3. **实现实时流式对话**，展示 AI 分析过程和工具调用
4. **专业数据分析工具风格**，支持深色/浅色主题切换

---

## 🛠 技术栈选型

### 核心框架
- **Vue 3.4+** - 使用 Composition API
- **TypeScript 5.3+** - 类型安全
- **Vite 5.0+** - 快速开发构建

### UI 框架与组件库
- **Naive UI** 或 **Element Plus** - 企业级 Vue 3 组件库
  - 推荐 Naive UI（更现代，TypeScript 支持更好）
- **TailwindCSS** - 原子化 CSS，快速样式开发
- **VueUse** - Vue 组合式工具集

### 状态管理与路由
- **Pinia** - Vue 3 官方状态管理
- **Vue Router 4** - 路由管理

### Markdown 与图表
- **markdown-it** - Markdown 渲染
- **highlight.js** - 代码高亮
- **ECharts** 或 **AntV G2Plot** - 图表展示（如果需要二次渲染）

### 工具库
- **axios** - HTTP 请求（备用，主要使用 SSE）
- **date-fns** - 日期处理
- **lodash-es** - 工具函数

---

## 📁 项目结构设计

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API 接口层
│   │   ├── chat.ts            # 聊天接口（SSE）
│   │   ├── session.ts         # 会话管理接口
│   │   └── types.ts           # API 类型定义
│   ├── assets/                # 静态资源
│   │   ├── styles/
│   │   │   ├── main.css
│   │   │   ├── theme-dark.css
│   │   │   └── theme-light.css
│   │   └── images/
│   ├── components/            # 通用组件
│   │   ├── chat/
│   │   │   ├── ChatMessage.vue        # 消息组件
│   │   │   ├── MessageInput.vue       # 输入框组件
│   │   │   ├── ToolCallCard.vue       # 工具调用卡片
│   │   │   └── StreamingText.vue      # 流式文本组件
│   │   ├── session/
│   │   │   ├── SessionList.vue        # 会话列表
│   │   │   ├── SessionItem.vue        # 会话项
│   │   │   └── SessionHeader.vue      # 会话头部
│   │   ├── common/
│   │   │   ├── MarkdownRenderer.vue   # Markdown 渲染器
│   │   │   ├── LoadingSpinner.vue     # 加载动画
│   │   │   ├── ThemeToggle.vue        # 主题切换
│   │   │   └── ErrorBoundary.vue      # 错误边界
│   │   └── layout/
│   │       ├── AppLayout.vue          # 主布局
│   │       └── Sidebar.vue            # 侧边栏
│   ├── composables/           # 组合式函数
│   │   ├── useChat.ts         # 聊天逻辑
│   │   ├── useSession.ts      # 会话管理
│   │   ├── useSSE.ts          # SSE 连接管理
│   │   ├── useTheme.ts        # 主题切换
│   │   └── useMessage.ts      # 消息处理
│   ├── stores/                # Pinia 状态管理
│   │   ├── chat.ts            # 聊天状态
│   │   ├── session.ts         # 会话状态
│   │   ├── theme.ts           # 主题状态
│   │   └── app.ts             # 应用状态
│   ├── router/                # 路由配置
│   │   └── index.ts
│   ├── types/                 # TypeScript 类型
│   │   ├── chat.ts
│   │   ├── session.ts
│   │   └── api.ts
│   ├── utils/                 # 工具函数
│   │   ├── request.ts
│   │   ├── storage.ts
│   │   └── format.ts
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎨 UI/UX 设计

### 整体布局
```
┌─────────────────────────────────────────────────────────┐
│  Header  [Logo] [Theme Toggle] [Settings]               │
├──────────┬──────────────────────────────────────────────┤
│          │  Chat Header [Session Title] [Delete]        │
│          ├──────────────────────────────────────────────┤
│ Session  │                                              │
│ List     │  Chat Messages Area                          │
│          │  ┌──────────────────────────────────────┐   │
│ [New]    │  │ User Message                         │   │
│          │  └──────────────────────────────────────┘   │
│ Session1 │  ┌──────────────────────────────────────┐   │
│ Session2 │  │ Assistant Message (Streaming)        │   │
│ Session3 │  │  - Text content                      │   │
│          │  │  - Tool Call Card (collapsible)     │   │
│          │  │  - Markdown tables/charts           │   │
│          │  └──────────────────────────────────────┘   │
│          ├──────────────────────────────────────────────┤
│          │  Input Area                                  │
│          │  [Text Input]          [Send Button]         │
└──────────┴──────────────────────────────────────────────┘
```

### 主题设计
- **深色主题**（默认）：适合数据分析，减少眼睛疲劳
- **浅色主题**：适合白天使用
- 主题切换持久化（localStorage）

### 消息样式设计
- **用户消息**：右侧对齐，蓝色背景
- **AI 消息**：左侧对齐，灰色背景
- **工具调用**：可折叠卡片，展示工具名称、参数、结果
- **代码块**：语法高亮，复制按钮
- **表格**：响应式表格，支持排序和筛选

---

## 🔧 核心功能实现

### 1. 会话管理

#### 功能需求
- ✅ 获取会话列表
- ✅ 创建新会话
- ✅ 删除会话
- ✅ 重命名会话
- ✅ 切换会话

#### 实现方案
```typescript
// stores/session.ts
export const useSessionStore = defineStore('session', () => {
  const sessions = ref<SessionInfo[]>([])
  const currentSessionId = ref<string | null>(null)

  // 加载会话列表
  async function loadSessions() {
    const data = await api.getSessions()
    sessions.value = data
  }

  // 创建会话
  async function createSession(title = '新对话') {
    const session = await api.createSession(title)
    sessions.value.unshift(session)
    return session
  }

  // 删除会话
  async function deleteSession(sessionId: string) {
    await api.deleteSession(sessionId)
    sessions.value = sessions.value.filter(s => s.session_id !== sessionId)
  }

  // 重命名会话
  async function renameSession(sessionId: string, newTitle: string) {
    await api.updateSession(sessionId, newTitle)
    const session = sessions.value.find(s => s.session_id === sessionId)
    if (session) session.title = newTitle
  }

  return {
    sessions,
    currentSessionId,
    loadSessions,
    createSession,
    deleteSession,
    renameSession
  }
})
```

### 2. 实时流式对话

#### 功能需求
- ✅ SSE 连接管理
- ✅ 流式文本展示（打字机效果）
- ✅ 工具调用实时展示
- ✅ 错误处理和重连

#### 实现方案
```typescript
// composables/useSSE.ts
export function useSSE(sessionId: string, message: string) {
  const events = ref<Event[]>([])
  const isStreaming = ref(false)
  const error = ref<string | null>(null)
  let controller: AbortController | null = null

  async function connect() {
    isStreaming.value = true
    error.value = null
    controller = new AbortController()

    try {
      const url = `http://localhost:8000/api/chatbi/chat?session_id=${sessionId}&message=${encodeURIComponent(message)}`

      const response = await fetch(url, {
        signal: controller.signal
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6))
            events.value.push(data)
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('SSE connection aborted')
      } else {
        error.value = err.message
      }
    } finally {
      isStreaming.value = false
    }
  }

  function abort() {
    controller?.abort()
  }

  return {
    events,
    isStreaming,
    error,
    connect,
    abort
  }
}
```

### 3. 消息组件设计

#### ChatMessage.vue
```vue
<template>
  <div :class="['message', role]">
    <div class="message-avatar">
      <UserIcon v-if="role === 'user'" />
      <BotIcon v-else />
    </div>
    <div class="message-content">
      <StreamingText
        v-if="isStreaming"
        :content="content"
      />
      <MarkdownRenderer
        v-else
        :content="content"
      />
      <ToolCallCard
        v-for="tool in toolCalls"
        :key="tool.id"
        :tool-call="tool"
      />
    </div>
  </div>
</template>
```

#### ToolCallCard.vue
```vue
<template>
  <div class="tool-call-card">
    <div class="tool-header" @click="toggleExpand">
      <ToolIcon />
      <span class="tool-name">{{ toolCall.name }}</span>
      <ChevronIcon :class="{ expanded }" />
    </div>
    <div v-if="expanded" class="tool-body">
      <div class="tool-section">
        <h4>参数</h4>
        <pre>{{ formatJSON(toolCall.arguments) }}</pre>
      </div>
      <div class="tool-section">
        <h4>结果</h4>
        <div class="tool-output">{{ toolCall.output }}</div>
      </div>
    </div>
  </div>
</template>
```

### 4. 路由设计

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/chat/:sessionId'
      },
      {
        path: 'chat/:sessionId',
        name: 'Chat',
        component: ChatView,
        props: true
      }
    ]
  }
]
```

---

## 🔄 状态管理设计

### Chat Store
```typescript
// stores/chat.ts
export const useChatStore = defineStore('chat', () => {
  const messages = ref<Message[]>([])
  const isStreaming = ref(false)

  async function sendMessage(sessionId: string, content: string) {
    // 添加用户消息
    messages.value.push({
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    })

    // 创建 AI 消息占位符
    const aiMessageIndex = messages.value.push({
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      toolCalls: []
    }) - 1

    // 建立 SSE 连接
    const { events, isStreaming, error } = useSSE(sessionId, content)
    await events.connect()

    // 处理流式事件
    for (const event of events.value) {
      if (event.type === 'text') {
        messages.value[aiMessageIndex].content += event.content
      } else if (event.type === 'tool') {
        messages.value[aiMessageIndex].toolCalls?.push(event.tool_call)
      } else if (event.type === 'error') {
        // 处理错误
      }
    }
  }

  return {
    messages,
    isStreaming,
    sendMessage
  }
})
```

---

## 🔌 API 集成

### API 类型定义
```typescript
// types/api.ts
export interface SessionInfo {
  session_id: string
  title: string
  updated_at: string
  message_count: number
}

export interface SessionDetail extends SessionInfo {
  messages: Message[]
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  toolCalls?: ToolCall[]
}

export interface ToolCall {
  name: string
  arguments: string
  output: string
  content?: string
}

export interface Event {
  type: 'text' | 'tool' | 'error'
  content?: string
  tool_call?: ToolCall
}
```

### API 请求封装
```typescript
// api/session.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000
})

export const sessionApi = {
  async getSessions(): Promise<SessionInfo[]> {
    const { data } = await api.get('/api/chatbi/sessions')
    return data
  },

  async getSession(sessionId: string): Promise<SessionDetail> {
    const { data } = await api.get(`/api/chatbi/sessions/${sessionId}`)
    return data
  },

  async createSession(title?: string): Promise<SessionInfo> {
    const { data } = await api.post('/api/chatbi/sessions', null, {
      params: { title }
    })
    return data
  },

  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/api/chatbi/sessions/${sessionId}`)
  },

  async updateSession(sessionId: string, newTitle: string): Promise<void> {
    await api.patch(`/api/chatbi/sessions/${sessionId}`, null, {
      params: { new_title: newTitle }
    })
  }
}
```

---

## 📦 开发流程

### 1. 项目初始化
```bash
# 创建 Vite + Vue 3 + TypeScript 项目
npm create vite@latest frontend -- --template vue-ts

# 安装依赖
cd frontend
npm install

# 安装核心依赖
npm install vue-router@4 pinia naive-ui
npm install @vueuse/core markdown-it highlight.js
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/markdown-it

# 初始化 TailwindCSS
npx tailwindcss init -p
```

### 2. 开发阶段
1. **第一阶段**：基础框架搭建
   - 项目结构创建
   - 路由和状态管理配置
   - 基础布局组件

2. **第二阶段**：会话管理功能
   - 会话列表组件
   - 会话 CRUD 操作
   - 侧边栏实现

3. **第三阶段**：聊天功能
   - SSE 连接管理
   - 消息组件
   - 流式文本展示
   - 工具调用卡片

4. **第四阶段**：UI 优化
   - 主题系统
   - 响应式布局
   - 动画效果

### 3. 构建与部署
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建
npm run preview
```

---

## 🎯 关键文件清单

### 需要创建的核心文件
- `src/api/chat.ts` - SSE 聊天接口
- `src/api/session.ts` - 会话管理接口
- `src/stores/chat.ts` - 聊天状态管理
- `src/stores/session.ts` - 会话状态管理
- `src/composables/useSSE.ts` - SSE 连接管理
- `src/components/chat/ChatMessage.vue` - 消息组件
- `src/components/chat/ToolCallCard.vue` - 工具调用卡片
- `src/components/session/SessionList.vue` - 会话列表

### 后端对接文件
- 后端 API 地址：`http://localhost:8000`
- SSE 端点：`/api/chatbi/chat`
- 会话管理端点：`/api/chatbi/sessions`

---

## ✅ 验证测试

### 功能测试清单
- [ ] 创建新会话
- [ ] 切换会话
- [ ] 重命名会话
- [ ] 删除会话
- [ ] 发送消息并接收流式响应
- [ ] 工具调用卡片展开/折叠
- [ ] Markdown 渲染正确
- [ ] 主题切换功能
- [ ] 错误处理和提示
- [ ] 响应式布局

### 性能优化
- 虚拟滚动（长消息列表）
- 防抖输入（避免频繁请求）
- 懒加载组件
- 图片懒加载

---

## 🚀 后续扩展

### 可选功能
1. **数据分析报告展示**
   - 报告列表
   - 报告详情页
   - PDF/Word 导出

2. **数据库配置管理**
   - 数据库连接配置界面
   - 表选择器
   - 数据源切换

3. **高级功能**
   - 消息搜索
   - 消息导出
   - 快捷指令
   - 多语言支持

---

## 📝 注意事项

1. **CORS 配置**：后端需要配置允许前端域名访问
2. **SSE 重连机制**：网络中断时自动重连
3. **错误处理**：友好的错误提示和降级处理
4. **类型安全**：充分利用 TypeScript 类型检查
5. **代码规范**：使用 ESLint + Prettier 保证代码质量
