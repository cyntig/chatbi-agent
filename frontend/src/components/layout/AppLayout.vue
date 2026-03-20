<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-body">
      <Sidebar />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useThemeStore } from '@/stores/theme'
import AppHeader from './AppHeader.vue'
import Sidebar from './Sidebar.vue'

const sessionStore = useSessionStore()
const themeStore = useThemeStore()

onMounted(async () => {
  // Load sessions on mount
  await sessionStore.loadSessions()
  // Apply theme
  themeStore.applyTheme(themeStore.theme)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
}
</style>
