<!-- Input area component -->
<template>
  <div class="input-area">
    <div class="input-area__container">
      <!-- Textarea -->
      <n-input
        ref="inputRef"
        v-model:value="inputText"
        type="textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        :autosize="{ minRows: 1, maxRows: 8 }"
        @keydown="handleKeyDown"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Action Buttons -->
      <div class="input-area__actions">
        <!-- Attach Button -->
        <n-tooltip>
          <template #trigger>
            <n-button quaternary circle :disabled="disabled">
              <template #icon>
                <n-icon><attach-outline /></n-icon>
              </template>
            </n-button>
          </template>
          附加文件
        </n-tooltip>

        <!-- Clear Button -->
        <n-tooltip v-if="inputText">
          <template #trigger>
            <n-button quaternary circle :disabled="disabled" @click="handleClear">
              <template #icon>
                <n-icon><close-outline /></n-icon>
              </template>
            </n-button>
          </template>
          清空输入
        </n-tooltip>

        <div class="input-area__spacer"></div>

        <!-- Character Count -->
        <span v-if="inputText" class="input-area__count">
          {{ inputText.length }} / {{ maxLength }}
        </span>

        <!-- Send Button -->
        <n-button
          type="primary"
          circle
          :disabled="!canSend"
          :loading="disabled"
          @click="handleSend"
        >
          <template #icon>
            <n-icon>
              <send-outline />
            </n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- Footer Info -->
    <div v-if="showFooter && isFocused" class="input-area__footer">
      <span class="input-area__hint">
        按 Enter 发送，Shift + Enter 换行
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import {
  NInput,
  NButton,
  NIcon,
  NTooltip
} from 'naive-ui'
import {
  AttachOutline,
  CloseOutline,
  SendOutline
} from '@vicons/ionicons5'

// Props
interface Props {
  disabled?: boolean
  maxLength?: number
  placeholder?: string
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  maxLength: 4000,
  placeholder: '输入您的问题...',
  showFooter: true
})

// Emits
interface Emits {
  (e: 'send', message: string): void
}

const emit = defineEmits<Emits>()

// Refs
const inputRef = ref()
const inputText = ref('')
const isFocused = ref(false)

// Computed
const canSend = computed(() => {
  return !props.disabled &&
         inputText.value.trim().length > 0 &&
         inputText.value.length <= props.maxLength
})

// Methods
function handleKeyDown(e: KeyboardEvent) {
  // Send on Enter (without Shift)
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  if (!canSend.value) return

  const message = inputText.value.trim()
  if (!message) return

  emit('send', message)
  inputText.value = ''

  // Reset textarea height
  nextTick(() => {
    inputRef.value?.textareaResizeTextarea?.()
  })
}

function handleClear() {
  inputText.value = ''
  inputRef.value?.focus()
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus()
})
</script>

<style scoped>
.input-area {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-area__container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--n-color);
  border: 1px solid var(--n-border-color);
  border-radius: var(--n-border-radius);
  transition: border-color 0.2s;
}

.input-area__container:focus-within {
  border-color: var(--n-primary-color);
}

.input-area__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-area__spacer {
  flex: 1;
}

.input-area__count {
  font-size: 0.75rem;
  color: var(--n-text-color-3);
  padding: 0 0.5rem;
}

.input-area__footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  animation: slideUp 0.2s ease-out;
}

.input-area__hint {
  font-size: 0.75rem;
  color: var(--n-text-color-3);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>