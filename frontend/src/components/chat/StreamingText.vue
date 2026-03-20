<template>
  <div class="streaming-text">
    <div class="content-text" v-html="renderedHtml"></div>
    <span v-if="isStreaming" class="cursor">|</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
}>()

const isStreaming = computed(() => props.content && props.content.length > 0)

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
  line-height: 1.6;
}

/* Markdown styles */
.content-text :deep(h1),
.content-text :deep(h2),
.content-text :deep(h3),
.content-text :deep(h4),
.content-text :deep(h5),
.content-text :deep(h6) {
  margin-top: 0.75em;
  margin-bottom: 0.25em;
  font-weight: 600;
  line-height: 1.25;
}

.content-text :deep(h1) {
  font-size: 1.5em;
}

.content-text :deep(h2) {
  font-size: 1.25em;
}

.content-text :deep(p) {
  margin-bottom: 0.5em;
}

.content-text :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: var(--bg-tertiary);
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.content-text :deep(pre) {
  padding: 1em;
  overflow: auto;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  margin-bottom: 0.5em;
}

.content-text :deep(pre code) {
  padding: 0;
  font-size: 100%;
  background: transparent;
}

.content-text :deep(ul),
.content-text :deep(ol) {
  padding-left: 2em;
  margin-bottom: 0.5em;
}

.content-text :deep(li) {
  margin-bottom: 0.1em;
}

.content-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 0.5em;
}

.content-text :deep(th),
.content-text :deep(td) {
  padding: 0.5em;
  border: 1px solid var(--border-color);
  text-align: left;
}

.content-text :deep(th) {
  background-color: var(--bg-tertiary);
  font-weight: 600;
}

.content-text :deep(blockquote) {
  padding-left: 1em;
  margin-left: 0;
  border-left: 4px solid var(--border-color);
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
  animation: blink 1s infinite;
  margin-left: 2px;
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
