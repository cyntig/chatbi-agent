<!-- Session search component -->
<template>
  <div class="session-search">
    <n-input
      v-model:value="searchQuery"
      placeholder="搜索会话..."
      clearable
      @input="handleSearch"
    >
      <template #prefix>
        <n-icon>
          <search-outline />
        </n-icon>
      </template>
    </n-input>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NIcon } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

// Props
interface Props {
  modelValue: string
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'update:modelValue', value: string): void
}

const emit = defineEmits<Emits>()

// State
const searchQuery = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue
})

// Methods
function handleSearch(value: string) {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.session-search {
  width: 100%;
}

.session-search :deep(.n-input) {
  --n-border: 1px solid var(--n-border-color);
}
</style>