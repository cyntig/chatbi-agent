<template>
  <div class="sidebar-wrapper">
    <aside
      class="sidebar"
      :class="{
        collapsed: appStore.sidebarCollapsed,
        mini: appStore.sidebarMode === 'mini',
        'mobile-open': appStore.isMobile && !appStore.sidebarCollapsed,
      }"
      role="navigation"
      aria-label="会话导航"
    >
      <!-- Top: Search + New Chat + Toggle -->
      <div class="sidebar-header">
        <button
          class="sidebar-toggle-btn"
          @click="appStore.toggleSidebar()"
          :aria-label="appStore.sidebarMode === 'expanded' ? '收起侧栏' : '展开侧栏'"
          :title="appStore.sidebarMode === 'mini' ? '展开侧栏' : '收起侧栏'"
        >
          <PanelLeft :size="18" :stroke-width="1.5" />
        </button>
        <button
          v-if="appStore.sidebarMode === 'expanded'"
          class="new-chat-icon-btn"
          @click="handleNewChat"
          aria-label="创建新对话"
          title="新对话"
        >
          <SquarePen :size="18" :stroke-width="1.5" />
        </button>
      </div>

      <!-- Search (expanded only) -->
      <div v-if="appStore.sidebarMode === 'expanded'" class="sidebar-search">
        <div class="search-box">
          <Search :size="14" :stroke-width="1.5" class="search-icon" />
          <input
            type="text"
            class="search-input"
            placeholder="搜索"
            v-model="searchQuery"
            aria-label="搜索对话"
          />
        </div>
      </div>

      <!-- Mini mode: new chat button -->
      <div v-if="appStore.sidebarMode === 'mini'" class="mini-actions">
        <button
          class="mini-icon-btn"
          @click="handleNewChat"
          aria-label="创建新对话"
          title="新对话"
        >
          <SquarePen :size="18" :stroke-width="1.5" />
        </button>
      </div>

      <!-- Session List -->
      <div v-if="appStore.sidebarMode === 'expanded'" class="sidebar-content">
        <SessionList :search-query="searchQuery" />
      </div>

      <!-- Bottom Controls -->
      <div class="sidebar-bottom">
        <button
          class="bottom-btn"
          @click="themeStore.toggleTheme()"
          :aria-label="themeStore.isDark ? '切换亮色模式' : '切换暗色模式'"
          :title="appStore.sidebarMode === 'mini' ? (themeStore.isDark ? '亮色模式' : '暗色模式') : undefined"
        >
          <Sun v-if="themeStore.isDark" :size="16" :stroke-width="1.5" />
          <Moon v-else :size="16" :stroke-width="1.5" />
          <span v-if="appStore.sidebarMode === 'expanded'" class="btn-label">
            {{ themeStore.isDark ? '亮色模式' : '暗色模式' }}
          </span>
        </button>
      </div>
    </aside>

    <!-- Desktop: collapsed expand button -->
    <Transition name="fade">
      <button
        v-if="appStore.sidebarCollapsed && !appStore.isMobile"
        class="expand-btn"
        @click="appStore.toggleSidebar()"
        aria-label="打开侧栏"
      >
        <PanelLeft :size="18" :stroke-width="1.5" />
      </button>
    </Transition>

    <!-- Mobile: hamburger button -->
    <Transition name="fade">
      <button
        v-if="appStore.isMobile && appStore.sidebarCollapsed"
        class="hamburger-btn"
        @click="appStore.toggleSidebar()"
        aria-label="打开菜单"
      >
        <Menu :size="20" :stroke-width="1.5" />
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useSessionStore } from '@/stores/session'
import { useThemeStore } from '@/stores/theme'
import { PanelLeft, SquarePen, Search, Sun, Moon, Menu } from 'lucide-vue-next'
import SessionList from '@/components/session/SessionList.vue'

const router = useRouter()
const appStore = useAppStore()
const sessionStore = useSessionStore()
const themeStore = useThemeStore()
const searchQuery = ref('')

onMounted(async () => {
  await sessionStore.loadSessions()
})

async function handleNewChat() {
  try {
    const newSession = await sessionStore.createSession('新对话')
    router.push(`/chat/${newSession.session_id}`)
    if (appStore.isMobile) {
      appStore.closeSidebar()
    }
  } catch (error) {
    console.error('Failed to create new chat:', error)
  }
}
</script>

<style scoped>
.sidebar-wrapper {
  position: relative;
  flex-shrink: 0;
  display: flex;
}

.sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  background-color: var(--bg-sidebar);
  transition: width var(--transition-base) cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  position: relative;
}

.sidebar.mini {
  width: 64px;
}

.sidebar.collapsed {
  width: 0;
}

/* Mobile overlay mode */
.sidebar.mobile-open {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  z-index: 200;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
}

/* ---- Header ---- */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 12px 4px;
  flex-shrink: 0;
}

.sidebar.mini .sidebar-header {
  justify-content: center;
  padding: 12px 8px 4px;
}

.sidebar-toggle-btn,
.new-chat-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
  flex-shrink: 0;
}

.sidebar-toggle-btn:hover,
.new-chat-icon-btn:hover {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

/* ---- Search ---- */
.sidebar-search {
  padding: 8px 12px;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background-color: var(--hover-bg);
  border-radius: var(--radius-lg);
  border: 1px solid transparent;
  transition: border-color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.search-box:focus-within {
  border-color: var(--border-color);
  background-color: var(--bg-primary);
}

.search-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: 0.8125rem;
  color: var(--text-primary);
  font-family: inherit;
  line-height: 1.4;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* ---- Mini actions ---- */
.mini-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 8px;
  gap: 4px;
}

.mini-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: color var(--transition-fast) ease,
              background-color var(--transition-fast) ease;
}

.mini-icon-btn:hover {
  color: var(--text-primary);
  background-color: var(--hover-bg);
}

/* ---- Session list container ---- */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 4px 8px;
}

/* ---- Bottom ---- */
.sidebar-bottom {
  padding: 8px;
  flex-shrink: 0;
}

.bottom-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  font-size: 0.8125rem;
  transition: background-color var(--transition-fast) ease,
              color var(--transition-fast) ease;
  min-height: 40px;
}

.sidebar.mini .bottom-btn {
  justify-content: center;
}

.bottom-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.btn-label {
  white-space: nowrap;
  overflow: hidden;
}

/* ---- Expand / Hamburger buttons ---- */
.expand-btn {
  position: fixed;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--bg-sidebar);
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-fast) ease,
              color var(--transition-fast) ease;
  z-index: 100;
}

.expand-btn:hover {
  background-color: var(--hover-bg);
  color: var(--text-primary);
}

.hamburger-btn {
  position: fixed;
  top: 8px;
  left: 8px;
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
  border-radius: var(--radius-lg);
  transition: background-color var(--transition-fast) ease;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.hamburger-btn:hover {
  background-color: var(--hover-bg);
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

@media (max-width: 767px) {
  .sidebar:not(.mobile-open) {
    width: 0 !important;
  }
}
</style>
