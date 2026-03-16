<!-- Loading spinner component -->
<template>
  <div :class="['loading-spinner', `loading-spinner--${size}`]">
    <div class="loading-spinner__container">
      <div class="loading-spinner__circle"></div>
      <div class="loading-spinner__circle"></div>
      <div class="loading-spinner__circle"></div>
    </div>
    <p v-if="text" class="loading-spinner__text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
// Props
interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: ''
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.loading-spinner--small {
  padding: 1rem;
}

.loading-spinner--large {
  padding: 3rem;
}

.loading-spinner__container {
  display: flex;
  gap: 0.25rem;
}

.loading-spinner__circle {
  width: var(--spinner-size, 12px);
  height: var(--spinner-size, 12px);
  border-radius: 50%;
  background: var(--n-primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-spinner--small .loading-spinner__circle {
  --spinner-size: 8px;
}

.loading-spinner--large .loading-spinner__circle {
  --spinner-size: 16px;
}

.loading-spinner__circle:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-spinner__circle:nth-child(2) {
  animation-delay: -0.16s;
}

.loading-spinner__text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--n-text-color-2);
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>