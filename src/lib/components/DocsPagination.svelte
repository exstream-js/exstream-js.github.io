<script lang="ts">
  import { page } from '$app/state'
  import { docsNavigation } from '$lib/content/navigation'

  type DocsPage = { href: string; label: string }

  const pages = docsNavigation.reduce<DocsPage[]>(
    (allPages, group) => [...allPages, ...group.items],
    [],
  )
  const currentIndex = $derived(pages.findIndex((item) => item.href === page.url.pathname))
  const previous = $derived(currentIndex > 0 ? pages[currentIndex - 1] : undefined)
  const next = $derived(
    currentIndex >= 0 && currentIndex < pages.length - 1 ? pages[currentIndex + 1] : undefined,
  )
</script>

{#if previous || next}
  <nav class="docs-pagination" aria-label="Previous and next documentation pages">
    {#if previous}
      <a class="previous" href={previous.href} rel="prev">
        <span class="arrow" aria-hidden="true">←</span>
        <span><small>Previous</small><strong>{previous.label}</strong></span>
      </a>
    {:else}
      <span></span>
    {/if}

    {#if next}
      <a class="next" href={next.href} rel="next">
        <span><small>Next</small><strong>{next.label}</strong></span>
        <span class="arrow" aria-hidden="true">→</span>
      </a>
    {/if}
  </nav>
{/if}

<style>
  .docs-pagination {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-top: clamp(4rem, 8vw, 6rem);
    border-top: 1px solid var(--line);
    padding-top: 1.5rem;
  }

  a {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.8rem;
    border: 1px solid var(--line);
    border-radius: 0.75rem;
    background: var(--surface);
    color: var(--ink);
    padding: 0.85rem 1rem;
    text-decoration: none;
    transition:
      border-color 140ms ease,
      transform 140ms ease;
  }

  a:hover {
    border-color: color-mix(in srgb, var(--accent) 60%, var(--line));
    transform: translateY(-1px);
  }

  .arrow {
    color: var(--accent);
    font-family: var(--font-mono);
  }

  a > span:not(.arrow) {
    display: grid;
    min-width: 0;
  }

  small {
    color: var(--ink-soft);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    overflow: hidden;
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .next {
    justify-content: flex-end;
    text-align: right;
  }

  @media (max-width: 560px) {
    .docs-pagination {
      grid-template-columns: 1fr;
    }

    .docs-pagination > span {
      display: none;
    }
  }
</style>
