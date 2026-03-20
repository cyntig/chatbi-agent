/**
 * Theme Store
 */

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { storage } from '@/utils/storage'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(storage.getTheme())
  const isDark = ref(theme.value === 'dark')

  /**
   * Apply theme to document
   */
  function applyTheme(newTheme: Theme): void {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    isDark.value = newTheme === 'dark'
  }

  /**
   * Set theme
   */
  function setTheme(newTheme: Theme): void {
    theme.value = newTheme
    storage.setTheme(newTheme)
    applyTheme(newTheme)
  }

  /**
   * Toggle theme
   */
  function toggleTheme(): void {
    const newTheme: Theme = theme.value === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  // Initialize theme
  applyTheme(theme.value)

  // Watch theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
})
