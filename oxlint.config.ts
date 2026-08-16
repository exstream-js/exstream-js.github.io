import { defineConfig } from 'oxlint'

export default defineConfig({
  plugins: ['node'],
  rules: {
    'no-unused-vars': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
  },
  ignorePatterns: [
    'node_modules/**',
    '.svelte-kit/**',
    'build/**',
    'coverage/**',
    'static/pagefind/**',
  ],
})
