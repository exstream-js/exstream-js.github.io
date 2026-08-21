<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation'
  import { page } from '$app/state'
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
  import type { DocsMetadata } from '$lib/content/docsMetadataTypes'
  import { onDestroy, onMount } from 'svelte'

  type TocItem = {
    id: string
    level: 2 | 3
    title: string
  }

  let items = $state<TocItem[]>([])
  let activeId = $state('')
  let headings: HTMLElement[] = []
  let updateFrame = 0
  const playground = $derived((page.data.docsMetadata as DocsMetadata | undefined)?.playground)

  function slugify(value: string) {
    return value
      .toLocaleLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  function ensureIds(elements: HTMLElement[]) {
    const used = new Set(
      Array.from(document.querySelectorAll<HTMLElement>('[id]')).map(({ id }) => id),
    )

    for (const heading of elements) {
      if (heading.id) continue

      const base = slugify(heading.textContent ?? '') || 'section'
      let id = base
      let suffix = 2

      while (used.has(id)) id = `${base}-${suffix++}`
      heading.id = id
      used.add(id)
    }
  }

  function updateActiveHeading() {
    updateFrame = 0
    if (headings.length === 0) return

    const documentHeight = document.documentElement.scrollHeight
    const viewportHeight = window.innerHeight
    const viewportBottom = window.scrollY + viewportHeight
    const remainingScroll = Math.max(0, documentHeight - viewportBottom)
    const baseThreshold = window.innerWidth <= 700 ? 150 : 110
    const bottomProgress = 1 - Math.min(1, remainingScroll / viewportHeight)
    const bottomThreshold = Math.max(baseThreshold, viewportHeight - 80)
    const threshold = baseThreshold + (bottomThreshold - baseThreshold) * bottomProgress
    let current = headings[0]!

    for (const heading of headings) {
      if (heading.getBoundingClientRect().top > threshold) break
      current = heading
    }

    activeId = current.id
  }

  function scheduleActiveUpdate() {
    if (updateFrame) return
    updateFrame = requestAnimationFrame(updateActiveHeading)
  }

  function collectHeadings() {
    headings = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.docs-content .page-frame h2, .docs-content .page-frame h3',
      ),
    )
    ensureIds(headings)
    items = headings.map((heading) => ({
      id: heading.id,
      level: Number(heading.tagName.slice(1)) as 2 | 3,
      title: heading.textContent?.trim() ?? '',
    }))
    updateActiveHeading()
  }

  async function scrollToItem(event: MouseEvent, item: TocItem) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return

    event.preventDefault()
    const target = document.getElementById(item.id)
    if (!target) return

    activeId = item.id
    await goto(`#${item.id}`, { keepFocus: true, noScroll: true })
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  afterNavigate(() => requestAnimationFrame(collectHeadings))

  onMount(() => {
    window.addEventListener('scroll', scheduleActiveUpdate, { passive: true })
    window.addEventListener('resize', scheduleActiveUpdate)

    return () => {
      window.removeEventListener('scroll', scheduleActiveUpdate)
      window.removeEventListener('resize', scheduleActiveUpdate)
    }
  })

  onDestroy(() => {
    if (updateFrame && typeof cancelAnimationFrame !== 'undefined')
      cancelAnimationFrame(updateFrame)
  })
</script>

<aside class="docs-toc" class:has-playground={playground} aria-label="Page tools">
  {#if items.length > 0}
    <p>On this page</p>
    <nav>
      <ol>
        {#each items as item (item.id)}
          <li class:toc-level-3={item.level === 3}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? 'location' : undefined}
              onclick={(event) => scrollToItem(event, item)}>{item.title}</a
            >
          </li>
        {/each}
      </ol>
    </nav>
  {/if}
  {#if playground}
    <div class="docs-playground">
      <p>Try it</p>
      <PlaygroundLink example={playground} compact />
    </div>
  {/if}
</aside>

<style>
  .docs-playground {
    margin-top: 1.5rem;
    border-top: 1px solid var(--line);
    padding-top: 1.5rem;
  }

  .docs-playground > p {
    margin: 0 0 0.65rem;
    color: var(--ink-soft);
    font-size: 0.68rem;
    font-weight: 720;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
