<script lang="ts">
  import Play from '@lucide/svelte/icons/play'
  import { getPlaygroundExample, type PlaygroundExampleId } from '$lib/content/playgroundExamples'

  let { example }: { example: PlaygroundExampleId } = $props()
  const playgroundExample = $derived(getPlaygroundExample(example))
</script>

{#if playgroundExample}
  <a class="playground-link" href={`/examples/playground/?example=${example}`}>
    <Play size={15} strokeWidth={2} aria-hidden="true" />
    <span>Open “{playgroundExample.title}” in the playground</span>
  </a>
{/if}

<style>
  .playground-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--line));
    min-height: 3.15rem;
    border-radius: 0.65rem;
    background: color-mix(in srgb, var(--accent) 8%, var(--surface));
    color: var(--accent-ink);
    margin: 0.55rem 0 2rem;
    padding: 0.72rem 0.95rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 700;
    line-height: 1.35;
    text-decoration: none;
  }

  .playground-link:hover {
    border-color: var(--accent);
    transform: translateY(-1px);
  }

  .playground-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
</style>
