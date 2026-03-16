<!-- Error boundary component -->
<template>
  <div class="error-boundary">
    <slot v-if="!hasError" />

    <div v-else class="error-boundary__content">
      <div class="error-boundary__icon">
        <n-icon size="64" color="#f56c6c">
          <alert-circle-outline />
        </n-icon>
      </div>

      <h3 class="error-boundary__title">出错了</h3>

      <p class="error-boundary__message">
        {{ errorMessage }}
      </p>

      <div v-if="showDetails && errorDetails" class="error-boundary__details">
        <n-collapse>
          <n-collapse-item title="错误详情" name="details">
            <pre class="error-boundary__stack">{{ errorDetails }}</pre>
          </n-collapse-item>
        </n-collapse>
      </div>

      <div class="error-boundary__actions">
        <n-button @click="handleRetry">
          <template #icon>
            <n-icon><refresh-outline /></n-icon>
          </template>
          重试
        </n-button>

        <n-button v-if="showReport" type="error" ghost @click="handleReport">
          <template #icon>
            <n-icon><bug-outline /></n-icon>
          </template>
          报告问题
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { NButton, NIcon, NCollapse, NCollapseItem } from 'naive-ui'
import {
  AlertCircleOutline,
  RefreshOutline,
  BugOutline
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

// Props
interface Props {
  fallbackMessage?: string
  showDetails?: boolean
  showReport?: boolean
  onError?: (error: Error, instance: any, info: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: '应用程序遇到了一些问题',
  showDetails: import.meta.env.DEV,
  showReport: true
})

// Emits
interface Emits {
  (e: 'retry'): void
  (e: 'report', error: Error): void
}

const emit = defineEmits<Emits>()

// Composables
const message = useMessage()

// State
const hasError = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')

// Error handling
onErrorCaptured((error: Error, instance, info) => {
  hasError.value = true
  errorMessage.value = props.fallbackMessage
  errorDetails.value = `Error: ${error.message}\n\nStack: ${error.stack}\n\nInfo: ${info}`

  // Call custom error handler if provided
  if (props.onError) {
    props.onError(error, instance, info)
  }

  // Prevent error from propagating
  return false
})

// Methods
function handleRetry() {
  hasError.value = false
  errorMessage.value = ''
  errorDetails.value = ''
  emit('retry')
}

function handleReport() {
  // In a real app, you would send this to your error tracking service
  const errorData = {
    message: errorMessage.value,
    details: errorDetails.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  console.error('Error Report:', errorData)

  message.info('错误报告已记录（演示功能）')
  emit('report', new Error(errorMessage.value))
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-boundary__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 2rem;
  text-align: center;
  min-height: 400px;
}

.error-boundary__icon {
  animation: shake 0.5s ease-in-out;
}

.error-boundary__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--n-text-color);
}

.error-boundary__message {
  margin: 0;
  color: var(--n-text-color-2);
  max-width: 500px;
}

.error-boundary__details {
  width: 100%;
  max-width: 600px;
}

.error-boundary__stack {
  background: var(--n-code-color);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  text-align: left;
  max-height: 300px;
  overflow-y: auto;
}

.error-boundary__actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}
</style>