import type { DocsMetadata } from '$lib/content/docsMetadataTypes'
import type { LayoutLoad } from './$types'

type MarkdownPage = {
  metadata?: DocsMetadata
}

const markdownPages = import.meta.glob<MarkdownPage>('/src/routes/docs/**/+page.md')

export const load: LayoutLoad = async ({ url }) => {
  const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
  const loadPage = markdownPages[`/src/routes${pathname}+page.md`]
  const pageModule = loadPage ? await loadPage() : undefined

  return {
    docsMetadata: pageModule?.metadata ?? {},
  }
}
