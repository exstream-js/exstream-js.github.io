<script lang="ts">
  import { afterNavigate } from '$app/navigation'
  import { mount, onDestroy, unmount } from 'svelte'
  import CopyButton from './CopyButton.svelte'

  type MountedComponent = ReturnType<typeof mount>

  const mountedButtons = new Map<HTMLElement, MountedComponent>()

  function removeButton(shell: HTMLElement) {
    const component = mountedButtons.get(shell)
    if (component) void unmount(component)
    mountedButtons.delete(shell)
  }

  function enhanceCodeBlocks() {
    for (const shell of mountedButtons.keys()) {
      if (!shell.isConnected) removeButton(shell)
    }

    for (const shell of document.querySelectorAll<HTMLElement>('.code-block-shell')) {
      if (!shell.isConnected || !shell.querySelector('pre')) {
        removeButton(shell)
        shell.remove()
      }
    }

    for (const pre of document.querySelectorAll<HTMLPreElement>('pre:not([data-copy-ready])')) {
      const code = pre.querySelector('code')
      if (!code) continue

      pre.dataset.copyReady = 'true'

      const shell = document.createElement('div')
      shell.className = 'code-block-shell'
      pre.before(shell)
      shell.append(pre)

      const component = mount(CopyButton, {
        target: shell,
        props: { text: code.textContent ?? '' },
      })
      mountedButtons.set(shell, component)
    }
  }

  afterNavigate(() => requestAnimationFrame(enhanceCodeBlocks))

  onDestroy(() => {
    for (const shell of mountedButtons.keys()) removeButton(shell)
  })
</script>
