import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import rehypeSlug from 'rehype-slug'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.svx', '.md'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx', '.md'], rehypePlugins: [rehypeSlug] }),
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
