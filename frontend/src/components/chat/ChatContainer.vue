<template>
  <div class="chat-container">
    <AppHeader />
    <MessageList />
    <MessageInput />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
</script>

<style scoped>
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--bg-primary);
}
</style>
