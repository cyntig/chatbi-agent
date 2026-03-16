<!-- Chart container component -->
<template>
  <div class="chart-container">
    <div v-if="loading" class="chart-container__loading">
      <n-spin size="medium" />
    </div>

    <div v-else-if="error" class="chart-container__error">
      <n-alert type="error" :bordered="false">
        {{ error }}
      </n-alert>
    </div>

    <div v-else class="chart-container__chart">
      <v-chart
        :option="chartOption"
        :autoresize="true"
        :style="{ height: height }"
        @click="handleChartClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { NSpin, NAlert } from 'naive-ui'
import type { ChartData } from '@/types'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// Props
interface Props {
  chart: ChartData
  height?: string
  loading?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  loading: false,
  error: ''
})

// Emits
interface Emits {
  (e: 'click', data: any): void
}

const emit = defineEmits<Emits>()

// Computed
const chartOption = computed(() => {
  const baseOption = {
    title: {
      text: props.chart.title,
      left: 'center'
    },
    tooltip: {
      trigger: 'auto',
      confine: true
    },
    legend: {
      bottom: 10
    },
    ...props.chart.options
  }

  // Add chart-specific options based on type
  switch (props.chart.type) {
    case 'line':
    case 'bar':
      return {
        ...baseOption,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: props.chart.data?.xAxis || []
        },
        yAxis: {
          type: 'value'
        },
        series: props.chart.data?.series || []
      }

    case 'pie':
      return {
        ...baseOption,
        series: [{
          type: 'pie',
          radius: '70%',
          data: props.chart.data?.data || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }

    case 'scatter':
      return {
        ...baseOption,
        grid: {
          left: '3%',
          right: '7%',
          bottom: '7%',
          containLabel: true
        },
        xAxis: {
          scale: true
        },
        yAxis: {
          scale: true
        },
        series: [{
          type: 'scatter',
          data: props.chart.data?.data || []
        }]
      }

    default:
      return baseOption
  }
})

// Methods
function handleChartClick(params: any) {
  emit('click', params)
}
</script>

<style scoped>
.chart-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.chart-container__loading,
.chart-container__error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  width: 100%;
}

.chart-container__chart {
  width: 100%;
  height: 100%;
}
</style>