<!-- Tool execution display component -->
<template>
  <div
    :class="[
      'tool-execution',
      `tool-execution--${tool.status}`
    ]"
  >
    <!-- Tool Header -->
    <div class="tool-execution__header">
      <div class="tool-execution__info">
        <n-icon :size="18" :class="`tool-execution__icon--${tool.status}`">
          <construct-outline />
        </n-icon>
        <span class="tool-execution__name">{{ tool.name }}</span>
        <n-tag
          :type="statusType"
          size="small"
          round
          :bordered="false"
        >
          {{ statusLabel }}
        </n-tag>
      </div>

      <div v-if="tool.startTime" class="tool-execution__time">
        {{ executionTime }}
      </div>
    </div>

    <!-- Tool Arguments -->
    <n-collapse v-if="showArguments && tool.arguments" arrows-placement="right">
      <n-collapse-item title="参数" name="arguments">
        <pre class="tool-execution__arguments">{{ formatArguments(tool.arguments) }}</pre>
      </n-collapse-item>
    </n-collapse>

    <!-- Tool Result -->
    <div v-if="tool.status === 'completed' && tool.result" class="tool-execution__result">
      <div class="tool-execution__result-header">
        <span>执行结果</span>
        <n-button text size="small" @click="toggleResultExpanded">
          <template #icon>
            <n-icon>
              <chevron-down-outline v-if="!resultExpanded" />
              <chevron-up-outline v-else />
            </n-icon>
          </template>
        </n-button>
      </div>

      <div v-if="resultExpanded" class="tool-execution__result-content">
        <!-- Result is data table -->
        <DataTable
          v-if="isTableResult"
          :data="tool.result"
        />

        <!-- Result is chart data -->
        <ChartContainer
          v-else-if="isChartResult"
          :chart="tool.result"
        />

        <!-- Result is text/JSON -->
        <pre v-else class="tool-execution__result-text">{{ formatResult(tool.result) }}</pre>
      </div>
    </div>

    <!-- Tool Error -->
    <div v-if="tool.status === 'failed' && tool.error" class="tool-execution__error">
      <n-alert type="error" :bordered="false">
        {{ tool.error }}
      </n-alert>
    </div>

    <!-- Progress for running tools -->
    <div v-if="tool.status === 'running'" class="tool-execution__progress">
      <n-progress
        type="line"
        :percentage="undefined"
        :show-indicator="false"
        :processing="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NIcon,
  NTag,
  NCollapse,
  NCollapseItem,
  NButton,
  NAlert,
  NProgress
} from 'naive-ui'
import {
  ConstructOutline,
  ChevronDownOutline,
  ChevronUpOutline
} from '@vicons/ionicons5'
import type { ToolCall } from '@/types'

// Props
interface Props {
  tool: ToolCall
  showArguments?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showArguments: true
})

// State
const resultExpanded = ref(false)

// Computed
const statusLabel = computed(() => {
  const labels = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败'
  }
  return labels[props.tool.status]
})

const statusType = computed(() => {
  const types = {
    pending: 'default',
    running: 'info',
    completed: 'success',
    failed: 'error'
  }
  return types[props.tool.status] as 'default' | 'info' | 'success' | 'error'
})

const executionTime = computed(() => {
  if (!props.tool.startTime) return ''

  const start = new Date(props.tool.startTime).getTime()
  const end = props.tool.endTime
    ? new Date(props.tool.endTime).getTime()
    : Date.now()

  const duration = end - start
  if (duration < 1000) return `${duration}ms`
  return `${(duration / 1000).toFixed(1)}s`
})

const isTableResult = computed(() => {
  return props.tool.result &&
    typeof props.tool.result === 'object' &&
    'rows' in props.tool.result &&
    'columns' in props.tool.result
})

const isChartResult = computed(() => {
  return props.tool.result &&
    typeof props.tool.result === 'object' &&
    'type' in props.tool.result &&
    'data' in props.tool.result
})

// Methods
function formatArguments(args: Record<string, any>): string {
  return JSON.stringify(args, null, 2)
}

function formatResult(result: any): string {
  if (typeof result === 'string') return result
  return JSON.stringify(result, null, 2)
}

function toggleResultExpanded() {
  resultExpanded.value = !resultExpanded.value
}
</script>

<style scoped>
.tool-execution {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--n-color);
  border-radius: var(--n-border-radius);
  border: 1px solid var(--n-border-color);
  transition: all 0.3s;
}

.tool-execution--running {
  border-color: var(--n-info-color);
  background: rgba(24, 160, 88, 0.05);
}

.tool-execution--completed {
  border-color: var(--n-success-color);
  background: rgba(24, 160, 88, 0.05);
}

.tool-execution--failed {
  border-color: var(--n-error-color);
  background: rgba(208, 48, 80, 0.05);
}

.tool-execution__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-execution__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tool-execution__icon--running {
  color: var(--n-info-color);
  animation: spin 1s linear infinite;
}

.tool-execution__icon--completed {
  color: var(--n-success-color);
}

.tool-execution__icon--failed {
  color: var(--n-error-color);
}

.tool-execution__name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--n-text-color);
}

.tool-execution__time {
  font-size: 0.75rem;
  color: var(--n-text-color-3);
}

.tool-execution__arguments {
  background: var(--n-code-color);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.tool-execution__result {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tool-execution__result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--n-text-color);
}

.tool-execution__result-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tool-execution__result-text {
  background: var(--n-code-color);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;
}

.tool-execution__error {
  margin-top: 0.5rem;
}

.tool-execution__progress {
  margin-top: 0.5rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>