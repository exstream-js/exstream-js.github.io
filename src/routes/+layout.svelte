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
  const playground = $derived(page.url.pathname.startsWith('/examples/playground/'))
</script>

<svelte:head>
  <meta
    name="description"
    content="Exstream connects JavaScript data sources, streaming transformations, and destinations."
  />
  <meta property="og:site_name" content="Exstream documentation" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Exstream — Array ergonomics. Stream semantics." />
  <meta
    property="og:description"
    content="High-level record operations with backpressure, bounded concurrency, branching, and explicit error handling."
  />
  <meta property="og:image" content="https://exstream-js.github.io/og-v2.png" />
  <meta property="og:image:alt" content="Exstream: Array ergonomics. Stream semantics." />
  <meta name="twitter:card" content="summary_large_image" />
  <script
    type="module"
    src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon={JSON.stringify({ token: 'bd6b902d380a4cf0b651a6c141e0cf7b' })}
  ></script>
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>
<CopyCode />
<PageTransitions />
<div class="site-header-backdrop" aria-hidden="true"></div>
<div class:playground-shell={playground}>
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
          href="/examples/playground/"
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

  <main id="main-content" class:playground-main={playground}>
    {@render children()}
  </main>

  {#if !playground && !page.url.pathname.startsWith('/docs/')}
    <footer class="site-footer">
      <div class="site-footer-inner">
        <Brand />
        <p>Composable streaming ETL for JavaScript. MIT licensed.</p>
        <nav aria-label="Footer navigation">
          <a href="https://github.com/micheletriaca/exstream">Source</a>
          <a href="https://github.com/micheletriaca/exstream/blob/master/SUPPORT.md">Support</a>
          <a href="/privacy/">Privacy</a>
        </nav>
      </div>
    </footer>
  {/if}
</div>

<style>
  .playground-shell {
    display: grid;
    width: 100%;
    height: 100dvh;
    min-height: 0;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
  }

  main.playground-main {
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
</style>
