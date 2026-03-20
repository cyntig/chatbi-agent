/**
 * Theme Composable
 */

import { ref, watch, onMounted } from 'vue'
import { storage } from '@/utils/storage'

export type Theme = 'light' | 'dark'

export function useTheme() {
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

  // Watch theme changes
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  // Initialize theme on mount
  onMounted(() => {
    applyTheme(theme.value)
  })

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
