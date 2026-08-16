<script lang="ts">
  import SearchIcon from '@lucide/svelte/icons/search'
  import X from '@lucide/svelte/icons/x'

  type PagefindResult = {
    data: () => Promise<{
      excerpt: string
      meta: { title?: string }
      url: string
    }>
  }

  type SearchItem = {
    excerpt: string
    title: string
    url: string
  }

  type PagefindApi = {
    init: () => Promise<void>
    search: (query: string) => Promise<{ results: PagefindResult[] }>
  }

  let open = $state(false)
  let query = $state('')
  let results = $state<SearchItem[]>([])
  let status = $state('Type to search the documentation.')
  let dialog = $state<HTMLDialogElement>()
  let requestId = 0

  function show() {
    open = true
    setTimeout(() => {
      dialog?.showModal()
      document.querySelector<HTMLInputElement>('#site-search')?.focus()
    })
  }

  function hide() {
    if (dialog?.open) dialog.close()
    open = false
    query = ''
    results = []
    status = 'Type to search the documentation.'
  }

  function handleShortcut(event: KeyboardEvent) {
    const target = event.target as HTMLElement
    const isTyping = target.matches('input, textarea, select, [contenteditable="true"]')

    if (event.key === '/' && !isTyping) {
      event.preventDefault()
      show()
    }

    if (event.key === 'Escape' && open) hide()
  }

  async function search() {
    const currentRequest = ++requestId
    const value = query.trim()

    if (!value) {
      results = []
      status = 'Type to search the documentation.'
      return
    }

    status = 'Searching…'

    try {
      const pagefindPath = '/pagefind/pagefind.js'
      const pagefind = (await import(/* @vite-ignore */ pagefindPath)) as PagefindApi
      await pagefind.init()
      const response = await pagefind.search(value)
      const items = await Promise.all(response.results.slice(0, 8).map((result) => result.data()))

      if (currentRequest !== requestId) return

      results = items.map((item) => ({
        excerpt: item.excerpt,
        title: item.meta.title ?? 'Untitled page',
        url: item.url,
      }))
      status =
        results.length === 0 ? 'No results. Try a different term.' : `${results.length} results`
    } catch {
      if (currentRequest !== requestId) return
      results = []
      status = 'Search is available in the production build.'
    }
  }

  function resultHref(url: string) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}q=${encodeURIComponent(query.trim())}`
  }
</script>

<svelte:window onkeydown={handleShortcut} />

<button class="search-trigger" type="button" onclick={show} aria-haspopup="dialog">
  <SearchIcon size={18} strokeWidth={2} aria-hidden="true" />
  <span>Search</span>
  <kbd>/</kbd>
</button>

{#if open}
  <dialog bind:this={dialog} class="search-dialog" aria-labelledby="search-title" onclose={hide}>
    <div class="search-heading">
      <h2 id="search-title">Search the docs</h2>
      <button class="icon-button" type="button" onclick={hide} aria-label="Close search">
        <X size={19} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
    <label class="sr-only" for="site-search">Search query</label>
    <input
      id="site-search"
      class="search-input"
      type="search"
      placeholder="Backpressure, CSV, mapAsync…"
      bind:value={query}
      oninput={search}
      autocomplete="off"
    />
    <p class="search-status" aria-live="polite">{status}</p>
    {#if results.length > 0}
      <ul class="search-results">
        {#each results as result (result.url)}
          <li>
            <a href={resultHref(result.url)} onclick={hide}>
              <strong>{result.title}</strong>
              <span>{@html result.excerpt}</span>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </dialog>
{/if}
