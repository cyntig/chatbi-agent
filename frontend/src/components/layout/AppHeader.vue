<template>
  <header class="app-header">
    <div class="header-center">
      <span class="model-name">ChatBI</span>
    </div>
  </header>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background-color: var(--bg-primary);
  height: 48px;
  flex-shrink: 0;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.model-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style>
