<script lang="ts">
  import Play from '@lucide/svelte/icons/play'
  import { getPlaygroundExample, type PlaygroundExampleId } from '$lib/content/playgroundExamples'

  let { example, compact = false }: { example: PlaygroundExampleId; compact?: boolean } = $props()
  const playgroundExample = $derived(getPlaygroundExample(example))
</script>

{#if playgroundExample}
  <a
    class="playground-link"
    class:compact
    href={`/examples/playground/?example=${example}`}
    aria-label={`Open “${playgroundExample.title}” in the playground`}
  >
    <Play size={15} strokeWidth={2} aria-hidden="true" />
    <span>Open playground</span>
  </a>
{/if}

<style>
  .playground-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--line);
    min-height: 3.15rem;
    border-radius: 0.65rem;
    background: var(--surface);
    color: var(--ink-soft);
    margin: 0.55rem 0 2rem;
    padding: 0.72rem 0.95rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.35;
    text-decoration: none;
    transition:
      background 140ms ease,
      border-color 140ms ease,
      color 140ms ease;
  }

  .playground-link:hover {
    border-color: color-mix(in srgb, var(--ink-soft) 42%, var(--line));
    background: var(--surface-strong);
    color: var(--ink);
  }

  .playground-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  .playground-link.compact {
    width: 100%;
    min-height: 0;
    margin: 0;
    padding: 0.68rem 0.75rem;
    font-size: 0.66rem;
  }

  .playground-link span {
    white-space: nowrap;
  }
</style>
