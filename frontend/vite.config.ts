import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,
    strictPort: false, // 如果端口被占用，自动尝试下一个
    proxy: {
      '/api': {
        target: 'http://localhost:8001', // BFF layer
        changeOrigin: true,
      },
      '/mcp': {
        target: 'http://localhost:8000', // MCP Server
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['naive-ui'],
          'chart-vendor': ['echarts', 'vue-echarts'],
          'utils-vendor': ['axios', 'dayjs', 'lodash-es'],
        },
      },
    },
  },
})
