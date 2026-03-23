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
  breaks: true,
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
  line-height: 1.7;
  color: var(--text-primary);
}

.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.375em;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-renderer :deep(h1) {
  font-size: 1.375em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.2em;
}

.markdown-renderer :deep(h3) {
  font-size: 1.1em;
}

.markdown-renderer :deep(p) {
  margin-bottom: 0.625em;
}

.markdown-renderer :deep(p:last-child) {
  margin-bottom: 0;
}

.markdown-renderer :deep(code) {
  padding: 0.15em 0.35em;
  margin: 0;
  font-size: 0.8125em;
  background-color: var(--code-bg);
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
  color: var(--text-primary);
}

.markdown-renderer :deep(pre) {
  padding: 1em;
  overflow: auto;
  background-color: var(--code-bg);
  border-radius: 0.5rem;
  margin: 0.625em 0;
}

.markdown-renderer :deep(pre code) {
  padding: 0;
  font-size: 0.8125rem;
  background: transparent;
  line-height: 1.5;
}

.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 0.625em;
}

.markdown-renderer :deep(li) {
  margin-bottom: 0.125em;
}

.markdown-renderer :deep(li > p) {
  margin-bottom: 0.25em;
}

.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.625em 0;
  font-size: 0.875em;
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  padding: 0.5em 0.75em;
  border: 1px solid var(--border-color);
  text-align: left;
}

.markdown-renderer :deep(th) {
  background-color: var(--code-bg);
  font-weight: 600;
}

.markdown-renderer :deep(tr:nth-child(even)) {
  background-color: var(--hover-bg);
}

.markdown-renderer :deep(blockquote) {
  padding: 0.25em 1em;
  margin: 0.625em 0;
  border-left: 3px solid var(--accent-color);
  color: var(--text-secondary);
  background-color: var(--hover-bg);
  border-radius: 0 0.25rem 0.25rem 0;
}

.markdown-renderer :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
}

.markdown-renderer :deep(a:hover) {
  text-decoration: underline;
}

.markdown-renderer :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1em 0;
}

.markdown-renderer :deep(strong) {
  font-weight: 600;
}

.markdown-renderer :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
}
</style>
