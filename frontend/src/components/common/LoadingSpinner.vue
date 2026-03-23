<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-sidebar-secondary);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
