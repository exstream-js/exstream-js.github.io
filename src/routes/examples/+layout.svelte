<script lang="ts">
  import { page } from '$app/state'

  let { children } = $props()
  const playground = $derived(page.url.pathname.startsWith('/examples/playground/'))
</script>

<div class:examples-world={!playground} class:playground-world={playground}>
  {@render children()}
</div>

<style>
  .playground-world {
    width: 100%;
    height: 100%;
    min-height: 0;
  }
</style>
