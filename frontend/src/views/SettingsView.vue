<!-- Settings view -->
<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>Settings</h2>
      <p class="subtitle">Customize your ChatBI experience</p>
    </div>

    <div class="settings-content">
      <!-- Appearance Settings -->
      <section class="settings-section">
        <h3>Appearance</h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Theme</h4>
            <p>Choose your preferred color scheme</p>
          </div>
          <div class="setting-control">
            <select v-model="theme" @change="handleThemeChange" class="theme-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Language</h4>
            <p>Select your language</p>
          </div>
          <div class="setting-control">
            <select v-model="language" @change="handleLanguageChange" class="language-select">
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Notifications Settings -->
      <section class="settings-section">
        <h3>Notifications</h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Enable Notifications</h4>
            <p>Receive notifications for updates and alerts</p>
          </div>
          <div class="setting-control">
            <label class="toggle">
              <input
                v-model="notifications"
                @change="handleNotificationsChange"
                type="checkbox"
                class="toggle-checkbox"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>

      <!-- Data Settings -->
      <section class="settings-section">
        <h3>Data</h3>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Clear All Data</h4>
            <p>Delete all local data including sessions and preferences</p>
          </div>
          <div class="setting-control">
            <button @click="handleClearData" class="btn-danger">
              Clear Data
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4>Export Data</h4>
            <p>Download all your data as JSON</p>
          </div>
          <div class="setting-control">
            <button @click="handleExportData" class="btn-secondary">
              Export
            </button>
          </div>
        </div>
      </section>

      <!-- About -->
      <section class="settings-section">
        <h3>About</h3>

        <div class="about-info">
          <div class="about-item">
            <span class="label">Version:</span>
            <span class="value">{{ APP_VERSION }}</span>
          </div>
          <div class="about-item">
            <span class="label">Description:</span>
            <span class="value">{{ APP_CONFIG.description }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSessionStore } from '@/stores/session'
import { useChatStore } from '@/stores/chat'
import { APP_CONFIG } from '@/utils/constants'

const userStore = useUserStore()
const sessionStore = useSessionStore()
const chatStore = useChatStore()

const APP_VERSION = '0.1.0'

const theme = ref(userStore.preferences.theme)
const language = ref(userStore.preferences.language)
const notifications = ref(userStore.preferences.notifications)

function handleThemeChange() {
  userStore.setTheme(theme.value as 'light' | 'dark' | 'auto')
}

function handleLanguageChange() {
  userStore.setLanguage(language.value)
}

function handleNotificationsChange() {
  userStore.setNotifications(notifications.value)
}

function handleClearData() {
  if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
    sessionStore.clearSessions()
    chatStore.clearMessages()
    userStore.reset()
    alert('All data has been cleared.')
  }
}

function handleExportData() {
  const data = {
    sessions: sessionStore.sessions,
    messages: chatStore.messages,
    preferences: userStore.preferences,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'chatbi-data-export.json'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.settings-view {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 2rem;
}

.settings-header h2 {
  margin: 0;
  font-size: 1.875rem;
  font-weight: 600;
  color: #1f2937;
}

.dark .settings-header h2 {
  color: #f9fafb;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: #6b7280;
}

.dark .subtitle {
  color: #9ca3af;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.settings-section {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .settings-section {
  background-color: #1f2937;
}

.settings-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.25rem;
  font-weight: 500;
  color: #1f2937;
}

.dark .settings-section h3 {
  color: #f9fafb;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.dark .setting-item {
  border-bottom-color: #374151;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
}

.dark .setting-info h4 {
  color: #f9fafb;
}

.setting-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .setting-info p {
  color: #9ca3af;
}

.setting-control select {
  padding: 0.5rem 2rem 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background-color: white;
  color: #1f2937;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}

.dark .setting-control select {
  background-color: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-checkbox:checked + .toggle-slider {
  background-color: #0ea5e9;
}

.toggle-checkbox:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.btn-danger,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-secondary {
  background-color: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background-color: #4b5563;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.about-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.about-item .label {
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
}

.about-item .value {
  color: #1f2937;
}

.dark .about-item .value {
  color: #f9fafb;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .setting-control {
    width: 100%;
  }

  .setting-control select {
    width: 100%;
  }
}
</style>
