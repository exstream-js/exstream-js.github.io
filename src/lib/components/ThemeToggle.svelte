<script lang="ts">
  import { browser } from '$app/environment'
  import Moon from '@lucide/svelte/icons/moon'
  import Sun from '@lucide/svelte/icons/sun'

  type Theme = 'light' | 'dark'

  let theme = $state<Theme>('light')
  let transitioning = $state(false)

  $effect(() => {
    if (!browser) return

    const saved = localStorage.getItem('exstream-theme') as Theme | null
    const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    theme = saved ?? preferred
    document.documentElement.dataset.theme = theme
  })

  function applyTheme(nextTheme: Theme) {
    theme = nextTheme
    document.documentElement.dataset.theme = nextTheme
    localStorage.setItem('exstream-theme', nextTheme)
  }

  async function toggle() {
    if (transitioning) return

    const nextTheme = theme === 'light' ? 'dark' : 'light'
    if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme(nextTheme)
      return
    }

    transitioning = true
    document.documentElement.classList.add('theme-transition')

    try {
      const transition = document.startViewTransition(() => applyTheme(nextTheme))
      await transition.finished
    } finally {
      document.documentElement.classList.remove('theme-transition')
      transitioning = false
    }
  }
</script>

<button
  class="icon-button"
  type="button"
  onclick={toggle}
  disabled={transitioning}
  aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
>
  {#if theme === 'light'}
    <Moon size={18} strokeWidth={2} aria-hidden="true" />
  {:else}
    <Sun size={18} strokeWidth={2} aria-hidden="true" />
  {/if}
</button>
