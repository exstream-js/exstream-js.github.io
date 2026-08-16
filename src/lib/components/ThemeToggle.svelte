<script lang="ts">
  import { browser } from '$app/environment'

  type Theme = 'light' | 'dark'

  let theme = $state<Theme>('light')

  $effect(() => {
    if (!browser) return

    const saved = localStorage.getItem('exstream-theme') as Theme | null
    const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    theme = saved ?? preferred
    document.documentElement.dataset.theme = theme
  })

  function toggle() {
    theme = theme === 'light' ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('exstream-theme', theme)
  }
</script>

<button
  class="icon-button"
  type="button"
  onclick={toggle}
  aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}
>
  <span aria-hidden="true">{theme === 'light' ? '◐' : '◑'}</span>
</button>
