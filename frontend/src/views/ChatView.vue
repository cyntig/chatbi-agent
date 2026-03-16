<!-- Chat interface view -->
<template>
  <div class="chat-view">
    <ChatInterface />
  </div>
</template>

<script setup lang="ts">
import ChatInterface from '@/components/chat/ChatInterface.vue'
</script>

<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
