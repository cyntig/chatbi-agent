<!-- Root component -->
<template>
  <div id="app" :class="{ dark: isDarkMode }">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NMessageProvider } from 'naive-ui'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const isDarkMode = computed(() => userStore.isDarkMode)

onMounted(() => {
  // Initialize user preferences
  userStore.loadPreferences()
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f9fafb;
  transition: background-color 0.3s ease;
}

#app.dark {
  background-color: #111827;
}
</style>