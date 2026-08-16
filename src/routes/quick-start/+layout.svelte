<script lang="ts">
  let { children } = $props()
</script>

<div class="standalone-shell">
  <article class="docs-content prose page-frame" data-pagefind-body>
    {@render children()}
  </article>
</div>
