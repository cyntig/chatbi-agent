<!-- Modal component -->
<template>
  <n-modal
    v-model:show="isShow"
    :mask-closable="maskClosable"
    :closable="closable"
    :close-on-esc="closeOnEsc"
    :auto-focus="autoFocus"
    :style="{ width: width }"
    :preset="preset"
    :title="title"
    :type="type"
    @update:show="handleClose"
  >
    <slot />
  </n-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal } from 'naive-ui'

// Props
interface Props {
  show: boolean
  title?: string
  width?: string
  preset?: 'card' | 'dialog'
  type?: 'info' | 'success' | 'warning' | 'error'
  maskClosable?: boolean
  closable?: boolean
  closeOnEsc?: boolean
  autoFocus?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  preset: 'card',
  type: 'info',
  maskClosable: true,
  closable: true,
  closeOnEsc: true,
  autoFocus: true
})

// Emits
interface Emits {
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// State
const isShow = ref(props.show)

// Watch for external changes
watch(() => props.show, (newValue) => {
  isShow.value = newValue
})

// Methods
function handleClose(value: boolean) {
  emit('update:show', value)
  if (!value) {
    emit('close')
  }
}
</script>

<style scoped>
/* Add any custom modal styles here if needed */
</style>