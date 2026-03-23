<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="visible" class="confirm-overlay" @click.self="handleCancel" role="dialog" aria-modal="true" :aria-label="title">
        <div class="confirm-dialog" ref="dialogRef">
          <div class="confirm-header">
            <div class="confirm-icon" :class="variant">
              <AlertTriangle v-if="variant === 'danger'" :size="20" :stroke-width="1.5" />
              <Info v-else :size="20" :stroke-width="1.5" />
            </div>
            <h3 class="confirm-title">{{ title }}</h3>
          </div>
          <p v-if="message" class="confirm-message">{{ message }}</p>
          <div class="confirm-actions">
            <button
              class="confirm-btn confirm-btn--cancel"
              @click="handleCancel"
              ref="cancelBtnRef"
            >
              {{ cancelText }}
            </button>
            <button
              class="confirm-btn"
              :class="variant === 'danger' ? 'confirm-btn--danger' : 'confirm-btn--primary'"
              @click="handleConfirm"
              ref="confirmBtnRef"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { AlertTriangle, Info } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  visible: boolean
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
}>(), {
  confirmText: '确定',
  cancelText: '取消',
  variant: 'info',
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

const dialogRef = ref<HTMLElement | null>(null)
const cancelBtnRef = ref<HTMLButtonElement | null>(null)
const confirmBtnRef = ref<HTMLButtonElement | null>(null)

function handleConfirm() {
  emit('confirm')
  emit('update:visible', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:visible', false)
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.visible) return
  if (e.key === 'Escape') {
    handleCancel()
  }
  // Trap focus within dialog
  if (e.key === 'Tab' && dialogRef.value) {
    const focusable = dialogRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first?.focus()
    }
  }
}

watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    cancelBtnRef.value?.focus()
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 9000;
  padding: 16px;
}

.confirm-dialog {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.confirm-icon.danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--destructive);
}

.confirm-icon.info {
  background-color: var(--accent-subtle);
  color: var(--accent-color);
}

.confirm-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.confirm-message {
  margin: 8px 0 0;
  padding-left: 48px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}

.confirm-btn {
  padding: 8px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: inherit;
  transition: background-color var(--transition-fast) ease,
              transform var(--transition-fast) ease;
  min-height: 36px;
}

.confirm-btn:active {
  transform: scale(0.97);
}

.confirm-btn--cancel {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.confirm-btn--cancel:hover {
  background-color: var(--border-color);
}

.confirm-btn--primary {
  background-color: var(--accent-color);
  color: #ffffff;
}

.confirm-btn--primary:hover {
  background-color: var(--accent-hover);
}

.confirm-btn--danger {
  background-color: var(--destructive);
  color: #ffffff;
}

.confirm-btn--danger:hover {
  background-color: var(--destructive-hover);
}

/* Dialog transition */
.dialog-enter-active {
  transition: opacity 200ms ease-out;
}

.dialog-enter-active .confirm-dialog {
  transition: transform 250ms cubic-bezier(0.16, 1, 0.3, 1),
              opacity 200ms ease-out;
}

.dialog-leave-active {
  transition: opacity 150ms ease-in;
}

.dialog-leave-active .confirm-dialog {
  transition: transform 150ms ease-in,
              opacity 150ms ease-in;
}

.dialog-enter-from {
  opacity: 0;
}

.dialog-enter-from .confirm-dialog {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.dialog-leave-to {
  opacity: 0;
}

.dialog-leave-to .confirm-dialog {
  opacity: 0;
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .dialog-enter-active,
  .dialog-leave-active,
  .dialog-enter-active .confirm-dialog,
  .dialog-leave-active .confirm-dialog {
    transition: none;
  }
}
</style>
