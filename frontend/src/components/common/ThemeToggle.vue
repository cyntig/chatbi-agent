<template>
  <button class="theme-toggle" @click="toggleTheme" :title="`Switch to ${isDark ? 'light' : 'dark'} theme`">
    <Sun v-if="isDark" :size="20" :stroke-width="1.5" />
    <Moon v-else :size="20" :stroke-width="1.5" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Sun, Moon } from 'lucide-vue-next'

const themeStore = useThemeStore()

const isDark = computed(() => themeStore.isDark)

function toggleTheme() {
  themeStore.toggleTheme()
}
</script>

<style scoped>
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 0.375rem;
  transition: background-color 0.2s, color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}
</style>
