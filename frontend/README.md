# ChatBI Frontend

A modern, professional data analysis frontend application built with Vue 3 and TypeScript.

## Features

- 🎨 Modern UI with dark/light theme support
- 💬 Real-time streaming chat interface
- 📊 Multi-session management
- 🔧 Tool call visualization
- 📝 Markdown rendering with syntax highlighting
- 📱 Responsive design

## Tech Stack

- **Framework**: Vue 3.4+ with Composition API
- **Language**: TypeScript 5.3+
- **Build Tool**: Vite 5.0+
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **UI Components**: Custom components with TailwindCSS
- **Markdown**: markdown-it with highlight.js
- **HTTP Client**: Axios
- **Utilities**: date-fns, lodash-es

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/              # API interfaces
│   ├── assets/           # Static assets
│   ├── components/       # Vue components
│   │   ├── chat/        # Chat-related components
│   │   ├── session/     # Session-related components
│   │   ├── common/      # Shared components
│   │   └── layout/      # Layout components
│   ├── composables/     # Vue composables
│   ├── stores/          # Pinia stores
│   ├── router/          # Vue Router configuration
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── views/           # Page components
│   ├── App.vue          # Root component
│   └── main.ts          # Entry point
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update VITE_API_BASE_URL in .env if needed
```

### Development

```bash
# Start development server
npm run dev

# Navigate to http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend API

The frontend expects the following API endpoints:

- `GET /api/chatbi/sessions` - List all sessions
- `GET /api/chatbi/sessions/:id` - Get session details
- `POST /api/chatbi/sessions` - Create new session
- `DELETE /api/chatbi/sessions/:id` - Delete session
- `PATCH /api/chatbi/sessions/:id` - Update session title
- `GET /api/chatbi/chat` - SSE chat endpoint

## Components

### Chat Components

- `ChatHeader` - Session header with rename/delete actions
- `ChatMessages` - Message list container
- `ChatMessage` - Individual message component
- `ChatInput` - Message input with send button
- `StreamingText` - Typing animation for streaming text
- `ToolCallCard` - Collapsible tool call display

### Session Components

- `SessionList` - List of all sessions
- `SessionItem` - Individual session item

### Layout Components

- `AppLayout` - Main application layout
- `AppHeader` - Application header
- `Sidebar` - Collapsible sidebar with session list

### Common Components

- `ThemeToggle` - Dark/light theme switcher
- `LoadingSpinner` - Loading indicator
- `MarkdownRenderer` - Markdown rendering with syntax highlighting
- `ErrorBoundary` - Error display component

## State Management

### Stores

- `useChatStore` - Chat messages and streaming state
- `useSessionStore` - Session management
- `useThemeStore` - Theme preferences
- `useAppStore` - Global app state

### Composables

- `useChat` - Chat functionality
- `useSession` - Session management
- `useSSE` - SSE connection handling
- `useTheme` - Theme switching
- `useMessage` - Message operations

## Styling

The application uses TailwindCSS with CSS custom properties for theming:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
  --accent-color: #3b82f6;
}

.dark {
  --bg-primary: #1f2937;
  --bg-secondary: #111827;
  --bg-tertiary: #374151;
  --text-primary: #f9fafb;
  --text-secondary: #9ca3af;
  --border-color: #374151;
  --accent-color: #60a5fa;
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT
