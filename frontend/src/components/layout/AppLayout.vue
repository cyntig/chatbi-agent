<template>
  <div class="app-layout">
    <Sidebar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSessionStore } from '@/stores/session'
import { useThemeStore } from '@/stores/theme'
import Sidebar from './Sidebar.vue'

const sessionStore = useSessionStore()
const themeStore = useThemeStore()

onMounted(async () => {
  await sessionStore.loadSessions()
  themeStore.applyTheme(themeStore.theme)
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow: hidden;
  position: relative;
  background-color: var(--bg-primary);
}
</style>
