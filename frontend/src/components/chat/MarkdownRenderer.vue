<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

const props = defineProps<{
  content: string
  streaming?: boolean
}>()

function highlightCode(str: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
    } catch { /* fallthrough */ }
  }
  const escaped = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<pre class="hljs"><code>${escaped}</code></pre>`
}

const md: MarkdownIt = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight: highlightCode,
})

// 流式渲染使用 debounce，避免频繁重渲染
const debouncedContent = ref(props.content)
let timer: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.content,
  (val) => {
    if (props.streaming) {
      // 流式时 debounce 80ms
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        debouncedContent.value = val
      }, 80)
    } else {
      if (timer) clearTimeout(timer)
      debouncedContent.value = val
    }
  },
  { immediate: true }
)

const renderedHtml = computed(() => {
  let text = debouncedContent.value
  if (!text) return ''

  // 流式输出时添加光标
  if (props.streaming) {
    text += ' &#9646;'
  }

  return md.render(text)
})
</script>

<style scoped>
.markdown-body {
  color: var(--text-primary);
}

.markdown-body :deep(.hljs) {
  background: #282c34;
  color: #abb2bf;
  padding: 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0.75em 0;
  font-size: 0.9em;
  line-height: 1.5;
}

/* 图表图片样式 */
.markdown-body :deep(img) {
  max-width: 100%;
  border-radius: var(--radius-md);
  margin: 8px 0;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.markdown-body :deep(img:hover) {
  transform: scale(1.02);
}
</style>
