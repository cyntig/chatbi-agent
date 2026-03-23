/**
 * App Store
 * Global application state
 */

import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'

export type SidebarMode = 'expanded' | 'mini' | 'hidden'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const sidebarMode = ref<SidebarMode>('expanded')
  const isInitialized = ref(false)
  const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

  // Responsive breakpoints
  const isMobile = computed(() => windowWidth.value < 768)
  const isTablet = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
  const isDesktop = computed(() => windowWidth.value >= 1024)

  // Initialize responsive listener
  let resizeHandler: (() => void) | null = null

  function initResponsive() {
    resizeHandler = () => {
      windowWidth.value = window.innerWidth
      // Auto-collapse sidebar on mobile
      if (isMobile.value && !sidebarCollapsed.value) {
        sidebarCollapsed.value = true
        sidebarMode.value = 'hidden'
      }
    }
    window.addEventListener('resize', resizeHandler)

    // Set initial state based on screen size
    if (isMobile.value) {
      sidebarCollapsed.value = true
      sidebarMode.value = 'hidden'
    } else if (isTablet.value) {
      sidebarCollapsed.value = true
      sidebarMode.value = 'hidden'
    } else {
      sidebarCollapsed.value = false
      sidebarMode.value = 'expanded'
    }
  }

  function destroyResponsive() {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
  }

  /**
   * Toggle sidebar
   */
  function toggleSidebar(): void {
    if (isMobile.value) {
      // On mobile: toggle between hidden and expanded (overlay)
      sidebarCollapsed.value = !sidebarCollapsed.value
      sidebarMode.value = sidebarCollapsed.value ? 'hidden' : 'expanded'
    } else {
      // On desktop: toggle expanded ↔ mini
      if (sidebarMode.value === 'expanded') {
        sidebarMode.value = 'mini'
        sidebarCollapsed.value = false
      } else {
        sidebarMode.value = 'expanded'
        sidebarCollapsed.value = false
      }
    }
  }

  /**
   * Set sidebar state
   */
  function setSidebarCollapsed(collapsed: boolean): void {
    sidebarCollapsed.value = collapsed
    if (collapsed) {
      sidebarMode.value = 'hidden'
    } else {
      sidebarMode.value = 'expanded'
    }
  }

  /**
   * Close sidebar (for mobile overlay dismiss)
   */
  function closeSidebar(): void {
    sidebarCollapsed.value = true
    sidebarMode.value = 'hidden'
  }

  /**
   * Mark app as initialized
   */
  function setInitialized(initialized: boolean): void {
    isInitialized.value = initialized
  }

  return {
    sidebarCollapsed,
    sidebarMode,
    isInitialized,
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    initResponsive,
    destroyResponsive,
    toggleSidebar,
    setSidebarCollapsed,
    closeSidebar,
    setInitialized,
  }
})
