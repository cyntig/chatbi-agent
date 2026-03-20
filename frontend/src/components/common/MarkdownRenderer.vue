<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // 将单个换行符转换为 <br>
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})

const renderedHtml = computed(() => {
  if (!props.content) return ''
  return md.render(props.content)
})
</script>

<style scoped>
.markdown-renderer {
  line-height: 1.6;
  color: var(--text-primary);
}

.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  margin-top: 0.75em;
  margin-bottom: 0.25em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-renderer :deep(h1) {
  font-size: 1.5em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.25em;
}

.markdown-renderer :deep(p) {
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: var(--bg-tertiary);
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-renderer :deep(pre) {
  padding: 1em;
  overflow: auto;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(pre code) {
  padding: 0;
  font-size: 100%;
  background: transparent;
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  padding-left: 2em;
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(li) {
  margin-bottom: 0.1em;
}

.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.5em;
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--border-color);
  text-align: left;
}

.markdown-renderer :deep(th) {
  background-color: var(--bg-tertiary);
  font-weight: 600;
}

.markdown-renderer :deep(blockquote) {
  padding-left: 1em;
  margin-left: 0;
  border-left: 4px solid var(--border-color);
  color: var(--text-secondary);
}

.markdown-renderer :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
}

.markdown-renderer :deep(a:hover) {
  text-decoration: underline;
}
</style>
