<template>
  <div class="error-boundary">
    <div class="error-icon">⚠️</div>
    <h3 class="error-title">Something went wrong</h3>
    <p class="error-message">{{ error.message }}</p>
    <button class="retry-btn" @click="$emit('retry')">Retry</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: Error
}>()

defineEmits<{
  retry: []
}>()
</script>

<style scoped>
.error-boundary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
  text-align: center;
}

.error-icon {
  font-size: 3rem;
}

.error-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.error-message {
  margin: 0;
  color: var(--text-secondary);
  max-width: 400px;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  opacity: 0.9;
}
</style>
