<script lang="ts">
  import { page } from '$app/state'
  import ExternalLink from '@lucide/svelte/icons/external-link'
  import '../app.css'
  import Brand from '$lib/components/Brand.svelte'
  import CopyCode from '$lib/components/CopyCode.svelte'
  import GitHubIcon from '$lib/components/GitHubIcon.svelte'
  import PageTransitions from '$lib/components/PageTransitions.svelte'
  import Search from '$lib/components/Search.svelte'
  import ThemeToggle from '$lib/components/ThemeToggle.svelte'

  let { children } = $props()
</script>

<svelte:head>
  <meta
    name="description"
    content="Exstream is composable streaming ETL for JavaScript with end-to-end backpressure."
  />
  <meta property="og:site_name" content="Exstream documentation" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Exstream — composable streaming ETL" />
  <meta
    property="og:description"
    content="Build bounded, concurrent data pipelines without reimplementing backpressure and cancellation."
  />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>
<CopyCode />
<PageTransitions />
<header class="site-header">
  <div class="site-header-inner">
    <Brand />
    <nav class="primary-nav" aria-label="Primary navigation">
      <a
        href="/quick-start/"
        aria-current={page.url.pathname.startsWith('/quick-start/') ? 'page' : undefined}
        >Quick start</a
      >
      <a href="/docs/" aria-current={page.url.pathname.startsWith('/docs/') ? 'page' : undefined}
        >Docs</a
      >
      <a
        href="/examples/"
        aria-current={page.url.pathname.startsWith('/examples/') ? 'page' : undefined}>Examples</a
      >
      <a
        class="nav-external"
        href="https://github.com/micheletriaca/exstream"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub (opens in a new tab)"
      >
        <GitHubIcon size={16} />
        <span>GitHub</span>
        <ExternalLink
          class="external-link-indicator"
          size={13}
          strokeWidth={2}
          aria-hidden="true"
        />
      </a>
    </nav>
    <div class="header-actions">
      <Search />
      <ThemeToggle />
    </div>
  </div>
</header>

<main id="main-content">
  {@render children()}
</main>

<footer class="site-footer">
  <div class="site-footer-inner">
    <Brand />
    <p>Composable streaming ETL for JavaScript. MIT licensed.</p>
    <nav aria-label="Footer navigation">
      <a href="https://github.com/micheletriaca/exstream">Source</a>
      <a href="https://github.com/micheletriaca/exstream/blob/master/ROADMAP.md">Roadmap</a>
      <a href="https://github.com/micheletriaca/exstream/blob/master/SUPPORT.md">Support</a>
    </nav>
  </div>
</footer>
