<script lang="ts">
  import { page } from '$app/state'
  import TableOfContents from '$lib/components/TableOfContents.svelte'
  import { docsNavigation } from '$lib/content/navigation'

  let { children } = $props()
</script>

<div class="docs-shell">
  <aside class="docs-sidebar" aria-label="Documentation navigation">
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
      </div>
    {/key}
  </article>
  <TableOfContents />
</div>
