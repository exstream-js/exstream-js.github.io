<script lang="ts">
  import Check from '@lucide/svelte/icons/check'
  import Copy from '@lucide/svelte/icons/copy'
  import { onDestroy } from 'svelte'

  let { text }: { text: string } = $props()
  let copied = $state(false)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  async function writeToClipboard() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.append(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
  }

  async function copy() {
    await writeToClipboard()
    copied = true
    clearTimeout(resetTimer)
    resetTimer = setTimeout(() => (copied = false), 1_500)
  }

  onDestroy(() => clearTimeout(resetTimer))
</script>

<button
  class="copy-code-button"
  class:copied
  type="button"
  onclick={copy}
  aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
  title={copied ? 'Copied' : 'Copy'}
>
  {#if copied}
    <Check size={16} strokeWidth={2} aria-hidden="true" />
  {:else}
    <Copy size={16} strokeWidth={2} aria-hidden="true" />
  {/if}
</button>
