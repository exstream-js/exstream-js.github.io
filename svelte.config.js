import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/index.js'
import rehypeSlug from 'rehype-slug'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

globalThis.Prism = Prism
loadLanguages(['bash', 'csv', 'json', 'typescript'])

const languageAliases = {
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  ts: 'typescript',
}

const escapeSvelte = (value) =>
  value.replace(/[{}\x60]/g, (character) => {
    if (character === '{') return '&#123;'
    if (character === '}') return '&#125;'
    return '&#96;'
  })

const highlightCode = (code, language) => {
  const requestedLanguage = language?.toLowerCase() ?? 'text'
  const prismLanguage = languageAliases[requestedLanguage] ?? requestedLanguage
  const grammar = Prism.languages[prismLanguage]

  if (!grammar && prismLanguage !== 'text') {
    throw new Error(`Missing Prism grammar for ${requestedLanguage}`)
  }

  const highlighted = grammar
    ? Prism.highlight(code, grammar, prismLanguage)
    : code.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

  return `<pre class="language-${requestedLanguage}"><code class="language-${requestedLanguage}">${escapeSvelte(highlighted)}</code></pre>`
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx', '.md'],
      highlight: { highlighter: highlightCode, optimise: false },
      rehypePlugins: [rehypeSlug],
    }),
  ],
  kit: {
    adapter: adapter({
      fallback: '404.html',
      precompress: true,
      strict: true,
    }),
  },
}

export default config
