<script lang="ts">
  import { page } from '$app/state'
  import DocsPagination from '$lib/components/DocsPagination.svelte'
  import TableOfContents from '$lib/components/TableOfContents.svelte'
  import { docsNavigation } from '$lib/content/navigation'

  let { children } = $props()
  let navigationOpen = $state(false)

  const currentNavigationLabel = $derived(findNavigationLabel(page.url.pathname))

  $effect(() => {
    if (page.url.pathname) navigationOpen = false
  })

  function findNavigationLabel(pathname: string) {
    for (const group of docsNavigation) {
      const item = group.items.find((candidate) => candidate.href === pathname)
      if (item) return item.label
    }

    return 'Browse all pages'
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') navigationOpen = false
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="docs-shell">
  <button
    type="button"
    class="docs-menu-toggle"
    aria-expanded={navigationOpen}
    aria-controls="docs-navigation"
    onclick={() => (navigationOpen = !navigationOpen)}
  >
    <span class="docs-menu-icon" aria-hidden="true"><i></i><i></i><i></i></span>
    <span>
      <small>Documentation</small>
      <strong>{currentNavigationLabel}</strong>
    </span>
    <span class="docs-menu-action">{navigationOpen ? 'Close' : 'Menu'}</span>
  </button>

  <aside
    id="docs-navigation"
    class:open={navigationOpen}
    class="docs-sidebar"
    aria-label="Documentation navigation"
  >
    <p class="eyebrow">Documentation</p>
    <nav>
      {#each docsNavigation as group}
        <section>
          <h2>{group.label}</h2>
          <ul>
            {#each group.items as item}
              <li>
                <a
                  href={item.href}
                  aria-current={page.url.pathname === item.href ? 'page' : undefined}
                  onclick={() => (navigationOpen = false)}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </nav>
  </aside>
  <article class="docs-content prose" data-pagefind-body>
    {#key page.url.pathname}
      <div class="page-frame">
        {@render children()}
        <DocsPagination />
      </div>
    {/key}
  </article>
  <TableOfContents />
</div>
