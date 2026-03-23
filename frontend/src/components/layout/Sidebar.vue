<template>
  <aside
    class="sidebar"
    :class="{ collapsed: appStore.sidebarCollapsed }"
    role="navigation"
    aria-label="会话导航"
  >
    <!-- New Chat Button -->
    <div class="sidebar-top">
      <button
        class="new-chat-btn"
        @click="handleNewChat"
        aria-label="创建新对话"
      >
        <PlusIcon />
        <span v-if="!appStore.sidebarCollapsed" class="btn-text">新对话</span>
      </button>
      <button
        v-if="!appStore.sidebarCollapsed"
        class="icon-btn"
        @click="appStore.toggleSidebar()"
        aria-label="关闭侧栏"
      >
        <SidebarIcon />
      </button>
    </div>

    <!-- Session List -->
    <div class="sidebar-content">
      <SessionList />
    </div>

    <!-- Bottom Controls -->
    <div class="sidebar-bottom">
      <button
        class="bottom-btn"
        @click="themeStore.toggleTheme()"
        :aria-label="themeStore.isDark ? '切换亮色模式' : '切换暗色模式'"
      >
        <SunIcon v-if="themeStore.isDark" />
        <MoonIcon v-else />
        <span v-if="!appStore.sidebarCollapsed" class="btn-label">
          {{ themeStore.isDark ? '亮色模式' : '暗色模式' }}
        </span>
      </button>
    </div>

    <!-- Collapsed expand button -->
    <Transition name="fade">
      <button
        v-if="appStore.sidebarCollapsed"
        class="expand-btn"
        @click="appStore.toggleSidebar()"
        aria-label="打开侧栏"
      >
        <SidebarIcon />
      </button>
    </Transition>
  </aside>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSessionStore } from '@/stores/session'
import { useThemeStore } from '@/stores/theme'
import SessionList from '@/components/session/SessionList.vue'

const router = useRouter()
const appStore = useAppStore()
const sessionStore = useSessionStore()
const themeStore = useThemeStore()

onMounted(async () => {
  await sessionStore.loadSessions()
})

async function handleNewChat() {
  try {
    const newSession = await sessionStore.createSession('新对话')
    router.push(`/chat/${newSession.session_id}`)
  } catch (error) {
    console.error('Failed to create new chat:', error)
  }
}

// SVG Icon components (consistent 1.5px stroke weight)
const PlusIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  `,
}

const SidebarIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="9" y1="3" x2="9" y2="21"></line>
    </svg>
  `,
}

const SunIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  `,
}

const MoonIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
         aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    </svg>
  `,
}
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  background-color: var(--bg-sidebar);
  transition: width var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 0;
}

.sidebar-top {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 10px 14px;
  background: transparent;
  color: var(--text-sidebar);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast) ease;
  white-space: nowrap;
  min-height: 44px; /* Touch target §2 */
}

.new-chat-btn:hover {
  background-color: var(--bg-sidebar-hover);
}

.new-chat-btn:active {
  background-color: var(--bg-sidebar-active);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-sidebar-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: color var(--transition-fast) ease;
  flex-shrink: 0;
}

.icon-btn:hover {
  color: var(--text-sidebar);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

.sidebar-bottom {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: none;
  color: var(--text-sidebar);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  transition: background-color var(--transition-fast) ease;
  min-height: 44px; /* Touch target §2 */
}

.bottom-btn:hover {
  background-color: var(--bg-sidebar-hover);
}

.btn-label {
  white-space: nowrap;
  overflow: hidden;
}

.expand-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background-color var(--transition-fast) ease,
              box-shadow var(--transition-fast) ease;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.expand-btn:hover {
  background-color: var(--hover-bg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Transition for expand button */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base) ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
