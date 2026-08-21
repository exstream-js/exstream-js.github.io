<script lang="ts">
  import { page } from '$app/state'

  const notFound = $derived(page.status === 404)
  const requestedPath = $derived(page.url.pathname)
</script>

<svelte:head>
  <title>{notFound ? 'Page not found' : 'Something went wrong'} — Exstream</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page">
  <div class="error-copy">
    <p class="eyebrow">Error {page.status}</p>
    <h1>{notFound ? 'This branch ends here.' : 'Something interrupted the flow.'}</h1>

    {#if notFound}
      <p class="error-lead">
        There is no page at <code>{requestedPath}</code>. Check the address or continue from a known
        point in the documentation.
      </p>
    {:else}
      <p class="error-lead">
        We could not load this page. Try again, or continue from the documentation home.
      </p>
    {/if}

    <div class="error-actions">
      <a class="button" href="/docs/">Browse the docs</a>
      <a class="button secondary" href="/docs/reference/">API reference</a>
    </div>
  </div>

  <div class="error-visual" aria-hidden="true">
    <div class="error-visual-bar">
      <span>request.flow</span>
      <span>{page.status}</span>
    </div>
    <div class="error-flow">
      <span class="flow-node active">request</span>
      <span class="flow-break">×</span>
      <span class="flow-node missing">page</span>
    </div>
    <p>{notFound ? 'route_not_found' : 'flow_interrupted'}</p>
  </div>
</section>

<style>
  .error-page {
    display: grid;
    width: min(100% - 2rem, 72rem);
    min-height: calc(100svh - 4.5rem);
    margin-inline: auto;
    grid-template-columns: minmax(0, 1.05fr) minmax(22rem, 0.95fr);
    align-items: center;
    gap: clamp(3rem, 8vw, 8rem);
    padding-block: clamp(4rem, 9vw, 7rem);
  }

  .error-copy h1 {
    max-width: 11ch;
    margin: 0;
    font-size: clamp(3.2rem, 7vw, 6.2rem);
    font-weight: 780;
    letter-spacing: -0.07em;
    line-height: 0.94;
  }

  .error-lead {
    max-width: 38rem;
    margin: 1.6rem 0 0;
    color: var(--ink-soft);
    font-size: clamp(1rem, 2vw, 1.15rem);
    line-height: 1.6;
  }

  .error-lead code {
    border: 1px solid var(--line);
    border-radius: 0.35rem;
    background: var(--surface);
    color: var(--ink);
    padding: 0.12rem 0.35rem;
    font-family: var(--font-mono);
    font-size: 0.82em;
    overflow-wrap: anywhere;
  }

  .error-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-top: 2rem;
  }

  .error-visual {
    overflow: hidden;
    border: 1px solid #28332e;
    border-radius: 1.2rem;
    background: var(--code);
    box-shadow: var(--shadow);
    color: var(--code-ink);
  }

  .error-visual-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: 1px solid rgb(255 255 255 / 10%);
    padding: 0.85rem 1rem;
    color: #8fa097;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .error-visual-bar span:last-child {
    color: #ff9276;
  }

  .error-flow {
    display: grid;
    min-height: 13rem;
    grid-template-columns: auto auto auto;
    align-items: center;
    justify-content: center;
    gap: clamp(1rem, 4vw, 2rem);
    padding: 2rem 1.5rem;
  }

  .flow-node {
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 0.55rem;
    padding: 0.55rem 0.7rem;
    font-family: var(--font-mono);
    font-size: 0.68rem;
  }

  .flow-node.active {
    border-color: rgb(255 146 118 / 52%);
    background: rgb(255 146 118 / 10%);
    color: #ff9276;
  }

  .flow-node.missing {
    border-style: dashed;
    color: #718078;
  }

  .flow-break {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border: 1px solid rgb(255 146 118 / 42%);
    border-radius: 50%;
    background: rgb(255 146 118 / 9%);
    color: #ff9276;
    font-family: var(--font-mono);
  }

  .error-visual > p {
    margin: 0;
    border-top: 1px solid rgb(255 255 255 / 10%);
    padding: 0.8rem 1rem;
    color: #8fa097;
    font-family: var(--font-mono);
    font-size: 0.68rem;
  }

  @media (max-width: 850px) {
    .error-page {
      min-height: auto;
      grid-template-columns: 1fr;
      gap: 3rem;
    }

    .error-visual {
      width: min(100%, 36rem);
    }
  }

  @media (max-width: 520px) {
    .error-copy h1 {
      font-size: clamp(3rem, 16vw, 4.6rem);
    }

    .error-actions {
      display: grid;
    }

    .error-flow {
      grid-template-columns: auto auto auto;
      gap: 0.8rem;
      padding-inline: 0.8rem;
    }

    .flow-node {
      padding-inline: 0.5rem;
      font-size: 0.6rem;
    }
  }
</style>
