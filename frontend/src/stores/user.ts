// User state management

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserPreferences } from '@/types'
import { storage } from '@/utils/storage'

export const useUserStore = defineStore('user', () => {
  // State
  const preferences = ref<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    notifications: true,
  })

  const isAuthenticated = ref(false)
  const userId = ref<string>('')
  const userName = ref<string>('')
  const userEmail = ref<string>('')

  // Computed
  const isDarkMode = computed(() => {
    return preferences.value.theme === 'dark' ||
           (preferences.value.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  // Actions
  function loadPreferences() {
    const saved = storage.get<UserPreferences>('user_preferences')
    if (saved) {
      preferences.value = { ...preferences.value, ...saved }
    }
    applyTheme()
  }

  function savePreferences() {
    storage.set('user_preferences', preferences.value)
  }

  function updatePreferences(updates: Partial<UserPreferences>) {
    preferences.value = { ...preferences.value, ...updates }
    savePreferences()
    applyTheme()
  }

  function setTheme(theme: 'light' | 'dark' | 'auto') {
    preferences.value.theme = theme
    savePreferences()
    applyTheme()
  }

  function applyTheme() {
    const html = document.documentElement
    if (isDarkMode.value) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  function toggleTheme() {
    const newTheme = preferences.value.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  function setLanguage(language: string) {
    preferences.value.language = language
    savePreferences()
  }

  function setTimezone(timezone: string) {
    preferences.value.timezone = timezone
    savePreferences()
  }

  function setNotifications(enabled: boolean) {
    preferences.value.notifications = enabled
    savePreferences()
  }

  function login(userId: string, userName: string, userEmail: string) {
    isAuthenticated.value = true
    userId.value = userId
    userName.value = userName
    userEmail.value = userEmail
    storage.set('auth_token', userId)
  }

  function logout() {
    isAuthenticated.value = false
    userId.value = ''
    userName.value = ''
    userEmail.value = ''
    storage.remove('auth_token')
  }

  function reset() {
    preferences.value = {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: true,
    }
    logout()
  }

  // Initialize
  loadPreferences()

  return {
    // State
    preferences,
    isAuthenticated,
    userId,
    userName,
    userEmail,

    // Computed
    isDarkMode,

    // Actions
    loadPreferences,
    savePreferences,
    updatePreferences,
    setTheme,
    applyTheme,
    toggleTheme,
    setLanguage,
    setTimezone,
    setNotifications,
    login,
    logout,
    reset,
  }
})
