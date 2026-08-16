<script lang="ts">
  import { siGithub } from 'simple-icons'

  let { size = 16 }: { size?: number } = $props()
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path d={siGithub.path} />
</svg>
