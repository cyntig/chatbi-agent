<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found</p>
    <router-link to="/chat/new">Go to Chat</router-link>
  </div>
</template>

<script setup lang="ts">
// Component for 404 page
</script>

<style scoped>
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 1rem;
}

.not-found h1 {
  font-size: 4rem;
  font-weight: bold;
  color: var(--text-secondary);
}

.not-found p {
  font-size: 1.5rem;
  color: var(--text-secondary);
}

.not-found a {
  color: var(--accent-color);
  text-decoration: none;
}

.not-found a:hover {
  text-decoration: underline;
}
</style>
