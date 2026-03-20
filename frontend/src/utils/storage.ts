/**
 * Local Storage Utility
 */

type StorageKey = 'theme' | 'currentSessionId' | 'sidebarCollapsed'

export const storage = {
  /**
   * Get item from localStorage
   */
  get<T = any>(key: StorageKey): T | null {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error)
      return null
    }
  },

  /**
   * Set item in localStorage
   */
  set(key: StorageKey, value: any): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error)
    }
  },

  /**
   * Remove item from localStorage
   */
  remove(key: StorageKey): void {
    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
    }
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      window.localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  // Theme helpers
  getTheme(): 'light' | 'dark' {
    return this.get<'light' | 'dark'>('theme') || 'dark'
  },

  setTheme(theme: 'light' | 'dark'): void {
    this.set('theme', theme)
  },

  // Session helpers
  getCurrentSessionId(): string | null {
    return this.get<string>('currentSessionId')
  },

  setCurrentSessionId(sessionId: string): void {
    this.set('currentSessionId', sessionId)
  },

  // Sidebar helpers
  getSidebarCollapsed(): boolean {
    return this.get<boolean>('sidebarCollapsed') || false
  },

  setSidebarCollapsed(collapsed: boolean): void {
    this.set('sidebarCollapsed', collapsed)
  },
}

export default storage
