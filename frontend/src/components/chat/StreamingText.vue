<template>
  <div class="streaming-text">
    <div class="content-text" v-html="renderedHtml"></div>
    <span v-if="isStreaming" class="cursor"></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
  showCursor?: boolean
}>()

const isStreaming = computed(() => props.showCursor !== false)

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
.streaming-text {
  display: inline;
}

.content-text {
  display: inline;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  margin: 0;
  padding: 0;
  line-height: 1.7;
}

/* Markdown styles */
.content-text :deep(h1),
.content-text :deep(h2),
.content-text :deep(h3),
.content-text :deep(h4),
.content-text :deep(h5),
.content-text :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.375em;
  font-weight: 600;
  line-height: 1.3;
}

.content-text :deep(h1) { font-size: 1.375em; }
.content-text :deep(h2) { font-size: 1.2em; }

.content-text :deep(p) {
  margin-bottom: 0.625em;
}

.content-text :deep(code) {
  padding: 0.15em 0.35em;
  margin: 0;
  font-size: 0.8125em;
  background-color: var(--code-bg);
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}

.content-text :deep(pre) {
  padding: 1em;
  overflow: auto;
  background-color: var(--code-bg);
  border-radius: 0.5rem;
  margin: 0.625em 0;
}

.content-text :deep(pre code) {
  padding: 0;
  font-size: 0.8125rem;
  background: transparent;
  line-height: 1.5;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 0.625em;
}

.content-text :deep(li) {
  margin-bottom: 0.125em;
}

.content-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 0.625em 0;
  font-size: 0.875em;
}

.content-text :deep(th),
.content-text :deep(td) {
  padding: 0.5em 0.75em;
  border: 1px solid var(--border-color);
  text-align: left;
}

.content-text :deep(th) {
  background-color: var(--code-bg);
  font-weight: 600;
}

.content-text :deep(blockquote) {
  padding: 0.25em 1em;
  margin: 0.625em 0;
  border-left: 3px solid var(--accent-color);
  color: var(--text-secondary);
}

.content-text :deep(a) {
  color: var(--accent-color);
  text-decoration: none;
}

.content-text :deep(a:hover) {
  text-decoration: underline;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1.1em;
  background-color: var(--text-primary);
  animation: blink 1s infinite;
  margin-left: 1px;
  vertical-align: text-bottom;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
