<template>
  <div class="app-layout">
    <!-- Mobile overlay backdrop -->
    <Transition name="fade">
      <div
        v-if="appStore.isMobile && !appStore.sidebarCollapsed"
        class="sidebar-backdrop"
        @click="appStore.closeSidebar()"
      />
    </Transition>
    <Sidebar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useThemeStore } from '@/stores/theme'
import { useAppStore } from '@/stores/app'
import Sidebar from './Sidebar.vue'

const sessionStore = useSessionStore()
const themeStore = useThemeStore()
const appStore = useAppStore()

onMounted(async () => {
  appStore.initResponsive()
  await sessionStore.loadSessions()
  themeStore.applyTheme(themeStore.theme)

  // Escape key to close sidebar overlay on mobile
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  appStore.destroyResponsive()
  document.removeEventListener('keydown', handleEscape)
})

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && appStore.isMobile && !appStore.sidebarCollapsed) {
    appStore.closeSidebar()
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-primary);
  min-width: 0;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 199;
  backdrop-filter: blur(2px);
}

/* Transition for backdrop */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base) ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
