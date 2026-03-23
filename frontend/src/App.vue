<template>
  <div id="app" :class="{ dark: themeStore.isDark }">
    <!-- Skip to content link (Accessibility) -->
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <router-view v-slot="{ Component }">
      <Transition name="route-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  // Apply saved theme
  themeStore.applyTheme(themeStore.theme)
})
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 16px;
  z-index: 9999;
  padding: 8px 16px;
  background-color: var(--accent-color);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  transition: top 200ms ease;
}

.skip-link:focus {
  top: 8px;
}
</style>
