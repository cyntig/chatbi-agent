<!-- Data table component -->
<template>
  <div class="data-table">
    <!-- Table Header -->
    <div v-if="data.title" class="data-table__header">
      <h3>{{ data.title }}</h3>
      <div class="data-table__actions">
        <n-button text size="small" @click="handleExport">
          <template #icon>
            <n-icon><download-outline /></n-icon>
          </template>
          导出
        </n-button>
      </div>
    </div>

    <!-- Table Metadata -->
    <div v-if="showMetadata && hasMetadata" class="data-table__metadata">
      <n-tag v-if="data.metadata?.totalRows" size="small" :bordered="false">
        共 {{ data.metadata.totalRows }} 行
      </n-tag>
      <n-tag v-if="data.metadata?.schema" size="small" :bordered="false">
        {{ data.metadata.schema }}
      </n-tag>
      <n-tag v-if="data.metadata?.table" size="small" :bordered="false">
        {{ data.metadata.table }}
      </n-tag>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="data-table__loading">
      <n-spin size="medium" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="data-table__error">
      <n-alert type="error" :bordered="false">
        {{ error }}
      </n-alert>
    </div>

    <!-- Empty State -->
    <div v-else-if="isEmpty" class="data-table__empty">
      <n-empty description="暂无数据" />
    </div>

    <!-- Data Table -->
    <n-data-table
      v-else
      :columns="columns"
      :data="paginatedData"
      :pagination="paginationConfig"
      :bordered="true"
      :single-line="false"
      :scroll-x="scrollX"
      size="small"
    />

    <!-- Export Modal -->
    <n-modal v-model:show="showExportModal" preset="card" title="导出数据" style="width: 400px;">
      <div class="export-modal__content">
        <p>选择导出格式：</p>
        <n-space vertical>
          <n-button
            v-for="format in exportFormats"
            :key="format.value"
            @click="handleExportFormat(format.value)"
          >
            <template #icon>
              <n-icon><download-outline /></n-icon>
            </template>
            {{ format.label }}
          </n-button>
        </n-space>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  NDataTable,
  NButton,
  NIcon,
  NTag,
  NEmpty,
  NSpin,
  NAlert,
  NModal,
  NSpace,
  useMessage
} from 'naive-ui'
import { DownloadOutline } from '@vicons/ionicons5'
import { useExport } from '@/composables/useExport'
import type { TableData, Column } from '@/types'

// Props
interface Props {
  data: TableData
  loading?: boolean
  error?: string
  showMetadata?: boolean
  pageSize?: number
  scrollX?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: '',
  showMetadata: true,
  pageSize: 10,
  scrollX: 1200
})

// Composables
const message = useMessage()
const { exportData } = useExport()

// State
const showExportModal = ref(false)

// Data
const exportFormats = [
  { label: 'Excel (.xlsx)', value: 'excel' },
  { label: 'CSV (.csv)', value: 'csv' },
  { label: 'JSON (.json)', value: 'json' }
]

// Computed
const isEmpty = computed(() => {
  return !props.data.rows || props.data.rows.length === 0
})

const hasMetadata = computed(() => {
  return props.data.metadata &&
    (props.data.metadata.totalRows ||
     props.data.metadata.schema ||
     props.data.metadata.table)
})

const columns = computed<Column[]>(() => {
  return props.data.columns.map((col, index) => ({
    title: col,
    key: col,
    width: 150,
    ellipsis: {
      tooltip: true
    },
    render: (row: any) => {
      const value = row[col]
      if (value === null || value === undefined) return '-'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    }
  }))
})

const paginatedData = computed(() => {
  return props.data.rows || []
})

const paginationConfig = computed(() => ({
  pageSize: props.pageSize
}))

// Methods
function handleExport() {
  showExportModal.value = true
}

async function handleExportFormat(format: string) {
  try {
    showExportModal.value = false
    await exportData(props.data, format, props.data.title || 'data')
    message.success(`成功导出为 ${format.toUpperCase()}`)
  } catch (error) {
    message.error(`导出失败: ${error instanceof Error ? error.message : '未知错误'}`)
  }
}
</script>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-table__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.data-table__header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--n-text-color);
}

.data-table__actions {
  display: flex;
  gap: 0.5rem;
}

.data-table__metadata {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.data-table__loading,
.data-table__error,
.data-table__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.export-modal__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.export-modal__content p {
  margin: 0;
  color: var(--n-text-color-2);
}
</style>