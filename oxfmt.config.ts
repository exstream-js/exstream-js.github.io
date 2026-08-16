import { defineConfig } from 'oxfmt'

export default defineConfig({
  ignorePatterns: ['node_modules/**', '.svelte-kit/**', 'build/**', 'coverage/**'],
  semi: false,
  singleQuote: true,
  svelte: true,
  trailingComma: 'all',
})
