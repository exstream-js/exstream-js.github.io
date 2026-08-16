<script lang="ts">
  import { afterNavigate } from '$app/navigation'

  const preferredBlocks = 'p, li, dd, dt, blockquote, pre'
  const fallbackBlocks = 'h1, h2, h3, h4, h5, h6'

  function normalize(value: string) {
    return value.toLocaleLowerCase().replace(/\s+/g, ' ').trim()
  }

  function findMatch(elements: Element[], query: string) {
    const exact = elements.find((element) => normalize(element.textContent ?? '').includes(query))
    if (exact) return exact

    const words = query.split(' ').filter((word) => word.length > 2)
    if (words.length === 0) return

    return elements.find((element) => {
      const text = normalize(element.textContent ?? '')
      return words.every((word) => text.includes(word))
    })
  }

  function jumpToSearchMatch(url: URL | undefined) {
    const query = normalize(url?.searchParams.get('q') ?? '')
    if (!query) return false

    requestAnimationFrame(() => {
      const root = document.querySelector('.docs-content, .page-frame')
      if (!root) return

      root.querySelectorAll('.search-target').forEach((element) => {
        element.classList.remove('search-target')
      })

      const preferred = Array.from(root.querySelectorAll(preferredBlocks))
      const fallback = Array.from(root.querySelectorAll(fallbackBlocks))
      const target = findMatch(preferred, query) ?? findMatch(fallback, query)
      if (!target) return

      target.classList.add('search-target')
      target.scrollIntoView({ behavior: 'auto', block: 'center' })
    })

    return true
  }

  function changesPage(from: URL | undefined, to: URL | undefined) {
    return Boolean(from && to && from.pathname !== to.pathname && !to.hash)
  }

  afterNavigate((navigation) => {
    if (jumpToSearchMatch(navigation.to?.url)) return

    if (changesPage(navigation.from?.url, navigation.to?.url)) {
      window.scrollTo(0, 0)
    }
  })
</script>
