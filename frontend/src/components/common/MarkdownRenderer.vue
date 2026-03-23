<template>
  <div class="markdown-renderer" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'
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
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
    const copyBtn = `<button class="code-copy-btn" onclick="(function(btn){var code=btn.closest('.code-block-wrapper').querySelector('code');navigator.clipboard.writeText(code.textContent);btn.textContent='已复制!';setTimeout(function(){btn.textContent='复制'},1500)})(this)" aria-label="复制代码">复制</button>`
    const header = `<div class="code-block-header">${langLabel}${copyBtn}</div>`

    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<div class="code-block-wrapper">${header}<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre></div>`
      } catch (__) {}
    }
    return `<div class="code-block-wrapper">${header}<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre></div>`
  },
})

// Add loading="lazy" to all images
const defaultImageRender = md.renderer.rules.image || function(tokens: any, idx: any, options: any, env: any, self: any) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.image = function (tokens: any, idx: any, options: any, env: any, self: any) {
  tokens[idx].attrSet('loading', 'lazy')
  return defaultImageRender(tokens, idx, options, env, self)
}

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

.markdown-renderer :deep(.code-block-wrapper) {
  position: relative;
  margin: 0.625em 0;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.markdown-renderer :deep(.code-block-header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background-color: var(--code-bg);
  border-bottom: 1px solid var(--border-color);
  min-height: 32px;
}

.markdown-renderer :deep(.code-lang) {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: lowercase;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}

.markdown-renderer :deep(.code-copy-btn) {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-tertiary);
  cursor: pointer;
  font-family: inherit;
  transition: color var(--transition-fast) ease,
              border-color var(--transition-fast) ease;
}

.markdown-renderer :deep(.code-copy-btn:hover) {
  color: var(--text-primary);
  border-color: var(--text-tertiary);
}

.markdown-renderer :deep(pre) {
  padding: 1em;
  overflow: auto;
  background-color: var(--code-bg);
  margin: 0;
}

.markdown-renderer :deep(.code-block-wrapper pre) {
  border-radius: 0;
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
