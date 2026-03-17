<template>
  <div class="chart-image" :class="{ loaded, errored }">
    <div v-if="!loaded && !errored" class="skeleton"></div>
    <img
      v-show="loaded"
      :src="src"
      :alt="alt"
      loading="lazy"
      @load="loaded = true"
      @error="errored = true"
      @click="handleZoom"
    />
    <div v-if="errored" class="error-placeholder">
      <span>&#128247;</span>
      <span>图表加载失败</span>
    </div>

    <!-- 放大遮罩 -->
    <Teleport to="body">
      <div v-if="zoomed" class="zoom-overlay" @click="zoomed = false">
        <img :src="src" :alt="alt" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  src: string
  alt?: string
}>()

const loaded = ref(false)
const errored = ref(false)
const zoomed = ref(false)

function handleZoom() {
  if (loaded.value) {
    zoomed.value = true
  }
}
</script>

<style scoped>
.chart-image {
  position: relative;
  margin: 8px 0;
}

.skeleton {
  width: 100%;
  height: 200px;
  background: linear-gradient(90deg, var(--bg-code) 25%, var(--border-light) 50%, var(--bg-code) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

img {
  max-width: 100%;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-normal);
}

img:hover {
  transform: scale(1.02);
}

.error-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  background: var(--bg-code);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.zoom-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
  padding: 24px;
}

.zoom-overlay img {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius-md);
  box-shadow: none;
}
</style>
