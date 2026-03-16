<!-- Main layout component -->
<template>
  <div class="layout">
    <!-- Header -->
    <header class="layout-header">
      <div class="header-left">
        <div class="logo">
          <h1>ChatBI Agent</h1>
          <span class="version">v{{ APP_VERSION }}</span>
        </div>
      </div>

      <div class="header-center">
        <nav class="nav-menu">
          <router-link to="/chat" class="nav-item" active-class="active">
            <span class="icon">💬</span>
            <span>Chat</span>
          </router-link>
          <router-link to="/settings" class="nav-item" active-class="active">
            <span class="icon">⚙️</span>
            <span>Settings</span>
          </router-link>
        </nav>
      </div>

      <div class="header-right">
        <button @click="toggleTheme" class="theme-toggle" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="layout-body">
      <!-- Sidebar (Session List) -->
      <aside class="layout-sidebar">
        <SessionList />
      </aside>

      <!-- Main Content Area -->
      <main class="layout-main">
        <router-view />
      </main>
    </div>

    <!-- Footer -->
    <footer class="layout-footer">
      <div class="footer-content">
        <span class="status" :class="{ online: isOnline, offline: !isOnline }">
          {{ isOnline ? '🟢 Connected' : '🔴 Offline' }}
        </span>
        <span class="info">{{ APP_CONFIG.description }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import SessionList from '@/components/session/SessionList.vue'
import { APP_CONFIG } from '@/utils/constants'

const userStore = useUserStore()
const APP_VERSION = '0.1.0'

const isOnline = ref(navigator.onLine)

const isDarkMode = computed(() => userStore.isDarkMode)

function toggleTheme() {
  userStore.toggleTheme()
}

function handleOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', handleOnlineStatus)
  window.addEventListener('offline', handleOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnlineStatus)
  window.removeEventListener('offline', handleOnlineStatus)
})
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f9fafb;
}

.dark .layout {
  background-color: #111827;
}

/* Header */
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .layout-header {
  background-color: #1f2937;
  border-bottom-color: #374151;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.dark .header-left h1 {
  color: #f9fafb;
}

.version {
  font-size: 0.75rem;
  color: #6b7280;
  background-color: #f3f4f6;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.dark .version {
  background-color: #374151;
  color: #9ca3af;
}

/* Navigation */
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-menu {
  display: flex;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.dark .nav-item:hover {
  background-color: #374151;
  color: #f9fafb;
}

.nav-item.active {
  background-color: #dbeafe;
  color: #1e40af;
}

.dark .nav-item.active {
  background-color: #1e3a8a;
  color: #dbeafe;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.25rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: #f3f4f6;
}

.dark .theme-toggle:hover {
  background-color: #374151;
}

/* Body */
.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-sidebar {
  width: 280px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.dark .layout-sidebar {
  background-color: #1f2937;
  border-right-color: #374151;
}

.layout-main {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Footer */
.layout-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  background-color: white;
  border-top: 1px solid #e5e7eb;
}

.dark .layout-footer {
  background-color: #1f2937;
  border-top-color: #374151;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.status.online {
  color: #10b981;
}

.status.offline {
  color: #ef4444;
}

.info {
  flex: 1;
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .info {
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .layout-sidebar {
    display: none;
  }

  .header-center {
    display: none;
  }

  .layout-main {
    padding: 1rem;
  }

  .layout-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .footer-content {
    flex-direction: column;
    gap: 0.5rem;
  }

  .info {
    text-align: center;
  }
}
</style>
