/**
 * App Store
 * Global application state
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const isInitialized = ref(false)

  /**
   * Toggle sidebar
   */
  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  /**
   * Set sidebar state
   */
  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
  }

  /**
   * Mark app as initialized
   */
  function setInitialized(initialized: boolean): void {
    isInitialized.value = initialized
  }

  return {
    sidebarCollapsed,
    isInitialized,
    toggleSidebar,
    setSidebarCollapsed,
    setInitialized,
  }
})
