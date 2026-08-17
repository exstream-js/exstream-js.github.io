<script lang="ts">
  import { getPlaygroundExample } from '$lib/content/playgroundExamples'
  import { onDestroy, onMount } from 'svelte'
  import PlaygroundGraph from './PlaygroundGraph.svelte'

  type RunState = 'idle' | 'running' | 'complete' | 'stopped' | 'error'
  type DestinationState = 'idle' | 'open' | 'closed' | 'aborted' | 'stopped'
  type EditorTab = 'code' | 'description'
  type RuntimeTab = 'destinations' | 'console'
  type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'
  type ConsoleEntry = {
    id: number
    level: ConsoleLevel
    message: string
    elapsed: number
  }
  type DestinationPanel = {
    id: number
    name: string
    delay: number
    scriptDelay: number
    speedOverridden: boolean
    bufferSize: number
    values: unknown[]
    count: number
    state: DestinationState
  }
  type GraphNode = {
    id: string
    type: 'source' | 'transform' | 'fork' | 'destination'
    label: string
    depth: number
    input: number
    output: number
    active: number
    ready: number
    window: number
    errors: number
    capacity?: number
    status: 'open' | 'closed' | 'aborted'
    metric?: 'dropped' | 'errors'
  }
  type GraphEdge = {
    id: string
    from: string
    to: string
    queued: number
    flowed: number
    paused: boolean
    closed: boolean
  }

  const destinationSpeeds = [
    { rps: 0.1, delay: 10_000 },
    { rps: 0.2, delay: 5_000 },
    { rps: 0.5, delay: 2_000 },
    { rps: 1, delay: 1_000 },
    { rps: 2, delay: 500 },
    { rps: 5, delay: 200 },
    { rps: 10, delay: 100 },
    { rps: 20, delay: 50 },
    { rps: 50, delay: 20 },
    { rps: 100, delay: 10 },
    { rps: 250, delay: 4 },
    { rps: 500, delay: 2 },
    { rps: 1_000, delay: 1 },
    { rps: Infinity, delay: 0 },
  ] as const

  const starterCode = `const transactions = exstream(source('transactions'))
  .map((transaction) => ({
    ...transaction,
    risk: transaction.amount >= 5000 ? 'high' : 'normal',
  }))

const approved = transactions
  .fork()
  .filter((transaction) => transaction.risk === 'normal')

const review = transactions
  .fork()
  .filter((transaction) => transaction.risk === 'high')

await Promise.all([
  approved.pipeTo(destination('approved', { speed: 20 })),
  review.pipeTo(destination('manual-review', { speed: 5 })),
])`

  let code = $state(starterCode)
  let runState = $state<RunState>('idle')
  let destinations = $state<DestinationPanel[]>([])
  let graphNodes = $state<GraphNode[]>([])
  let graphEdges = $state<GraphEdge[]>([])
  let editorTab = $state<EditorTab>('code')
  let runtimeTab = $state<RuntimeTab>('destinations')
  let consoleEntries = $state<ConsoleEntry[]>([])
  let consoleOutput = $state<HTMLDivElement>()
  let errorMessage = $state('')
  let nextDestinationId = 1
  let nextConsoleEntryId = 1
  let lastDestinationScript = ''
  let codeUrlReady = $state(false)
  let playgroundExample = $state<ReturnType<typeof getPlaygroundExample>>()
  let worker: Worker | undefined

  const isRunning = $derived(runState === 'running')

  $effect(() => {
    const currentCode = code
    if (!codeUrlReady) return

    const timer = setTimeout(() => storeCodeInUrl(currentCode), 250)
    return () => clearTimeout(timer)
  })

  $effect(() => {
    const entryCount = consoleEntries.length
    if (runtimeTab !== 'console' || !consoleOutput || entryCount === 0) return

    requestAnimationFrame(() => {
      if (consoleOutput) consoleOutput.scrollTop = consoleOutput.scrollHeight
    })
  })

  $effect(() => {
    const currentCode = code
    if (isRunning || currentCode === lastDestinationScript) return
    lastDestinationScript = currentCode
    reconcileDestinationPanels(extractDestinations(currentCode))
  })

  type DestinationDeclaration = {
    name: string
    delay: number
  }

  function extractDestinations(script: string) {
    const declarations: DestinationDeclaration[] = []
    const pattern = /\bdestination\s*\(\s*(['"])((?:\\.|(?!\1).)*)\1(?:\s*,\s*\{([^{}]*)\})?/g

    for (const match of script.matchAll(pattern)) {
      const name = match[2]?.replace(/\\(['"\\])/g, '$1').trim()
      if (!name || declarations.some((declaration) => declaration.name === name)) continue

      const speedLiteral = match[3]?.match(/\bspeed\s*:\s*(Infinity|(?:\d+(?:\.\d*)?|\.\d+))/)?.[1]
      const speed = speedLiteral === 'Infinity' ? Infinity : Number(speedLiteral)
      declarations.push({
        name,
        delay: speed > 0 ? (speed === Infinity ? 0 : 1_000 / speed) : 100,
      })
    }

    return declarations
  }

  function createDestinationPanel({ name, delay }: DestinationDeclaration): DestinationPanel {
    return {
      id: nextDestinationId++,
      name,
      delay,
      scriptDelay: delay,
      speedOverridden: false,
      bufferSize: name === 'approved' ? 12 : name === 'manual-review' ? 8 : 10,
      values: [],
      count: 0,
      state: 'idle',
    }
  }

  function reconcileDestinationPanels(declarations: DestinationDeclaration[]) {
    const names = declarations.map((declaration) => declaration.name)
    const currentNames = destinations.map((destination) => destination.name)
    if (
      currentNames.length === names.length &&
      currentNames.every((name, index) => name === names[index]) &&
      destinations.every(
        (destination, index) => destination.scriptDelay === declarations[index]?.delay,
      )
    ) {
      return
    }

    const existing = new Map(destinations.map((destination) => [destination.name, destination]))
    destinations = declarations.map((declaration) => {
      const current = existing.get(declaration.name)
      if (!current) return createDestinationPanel(declaration)

      const scriptChanged = current.scriptDelay !== declaration.delay
      return {
        ...current,
        delay: scriptChanged && !current.speedOverridden ? declaration.delay : current.delay,
        scriptDelay: declaration.delay,
      }
    })
  }

  function createWorker() {
    worker?.terminate()
    worker = new Worker(new URL('../workers/exstream-playground.worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', (event) => {
      runState = 'error'
      errorMessage = event.message || 'The playground worker failed.'
      stopOpenDestinations('stopped')
    })
  }

  function run() {
    const configurations = destinations.map((destination) => ({
      name: destination.name.trim(),
      delay: destination.delay,
      bufferSize: destination.bufferSize,
    }))
    destinations = []
    graphNodes = []
    graphEdges = []
    consoleEntries = []
    nextConsoleEntryId = 1
    errorMessage = ''
    runState = 'running'
    createWorker()
    worker?.postMessage({ type: 'run', code, destinations: configurations })
  }

  function stop() {
    worker?.terminate()
    worker = undefined
    runState = 'stopped'
    stopOpenDestinations('stopped')
  }

  function reset() {
    worker?.terminate()
    worker = undefined
    code = playgroundExample?.code ?? starterCode
    runState = 'idle'
    graphNodes = []
    graphEdges = []
    consoleEntries = []
    nextConsoleEntryId = 1
    errorMessage = ''
    destinations = destinations.map((destination) => ({
      ...destination,
      values: [],
      count: 0,
      state: 'idle',
    }))
  }

  function changeDestinationSpeed(destination: DestinationPanel, event: Event) {
    const input = event.currentTarget as HTMLInputElement
    const speed = destinationSpeeds[Number(input.value)]
    if (!speed) return
    destination.delay = speed.delay
    destination.speedOverridden = true

    if (isRunning) {
      worker?.postMessage({
        type: 'destination:configure',
        name: destination.name.trim(),
        delay: destination.delay,
      })
    }
  }

  function stopOpenDestinations(state: DestinationState) {
    destinations = destinations.map((destination) =>
      destination.state === 'open' ? { ...destination, state } : destination,
    )
  }

  function handleMessage(event: MessageEvent<Record<string, unknown>>) {
    const message = event.data

    if (message.type === 'destination:registered') {
      const name = typeof message.name === 'string' ? message.name : ''
      if (!name || destinations.some((destination) => destination.name === name)) return

      const panel = createDestinationPanel({
        name,
        delay: typeof message.delay === 'number' ? message.delay : 100,
      })
      panel.delay = typeof message.delay === 'number' ? message.delay : panel.delay
      panel.bufferSize =
        typeof message.bufferSize === 'number' ? message.bufferSize : panel.bufferSize
      destinations.push(panel)
    } else if (message.type === 'destination:snapshot') {
      const name = typeof message.name === 'string' ? message.name : ''
      destinations = destinations.map((destination) =>
        destination.name.trim() === name
          ? {
              ...destination,
              values: Array.isArray(message.values) ? message.values : destination.values,
              count: typeof message.count === 'number' ? message.count : destination.count,
              state: isDestinationState(message.state) ? message.state : destination.state,
            }
          : destination,
      )
    } else if (message.type === 'graph') {
      graphNodes = Array.isArray(message.nodes) ? (message.nodes as GraphNode[]) : []
      graphEdges = Array.isArray(message.edges) ? (message.edges as GraphEdge[]) : []
    } else if (message.type === 'console' && Array.isArray(message.entries)) {
      const entries = message.entries.flatMap((entry) => {
        if (!entry || typeof entry !== 'object') return []
        const candidate = entry as Record<string, unknown>
        if (!isConsoleLevel(candidate.level) || typeof candidate.message !== 'string') return []

        return [
          {
            id: nextConsoleEntryId++,
            level: candidate.level,
            message: candidate.message,
            elapsed: typeof candidate.elapsed === 'number' ? candidate.elapsed : 0,
          },
        ]
      })
      consoleEntries = [...consoleEntries, ...entries].slice(-500)
    } else if (message.type === 'complete') {
      runState = 'complete'
      worker?.terminate()
      worker = undefined
    } else if (message.type === 'error') {
      runState = 'error'
      errorMessage = typeof message.message === 'string' ? message.message : 'The run failed.'
      stopOpenDestinations('aborted')
      worker?.terminate()
      worker = undefined
    }
  }

  function isDestinationState(value: unknown): value is DestinationState {
    return ['idle', 'open', 'closed', 'aborted', 'stopped'].includes(String(value))
  }

  function isConsoleLevel(value: unknown): value is ConsoleLevel {
    return ['log', 'info', 'warn', 'error'].includes(String(value))
  }

  function formatConsoleTime(milliseconds: number) {
    if (milliseconds < 1_000) return `+${Math.round(milliseconds)}ms`
    return `+${(milliseconds / 1_000).toFixed(2)}s`
  }

  function clearConsole() {
    consoleEntries = []
  }

  function formatValue(value: unknown) {
    if (typeof value === 'string') return value

    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }

  function destinationSpeedIndex(delay: number) {
    const exact = destinationSpeeds.findIndex((speed) => speed.delay === delay)
    if (exact >= 0) return exact

    return destinationSpeeds.reduce((closest, speed, index) => {
      const closestDistance = Math.abs(destinationSpeeds[closest]!.delay - delay)
      return Math.abs(speed.delay - delay) < closestDistance ? index : closest
    }, 0)
  }

  function formatSpeed(delay: number) {
    if (delay === 0) return 'maximum'
    const rps = 1_000 / delay
    return `${Number.isInteger(rps) ? rps : Number(rps.toFixed(1))} rps`
  }

  function handleEditorKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      if (!isRunning) run()
    }
  }

  function encodeCode(value: string) {
    let binary = ''
    for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte)
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
  }

  function decodeCode(value: string) {
    try {
      const normalized = value.replaceAll('-', '+').replaceAll('_', '/')
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
      const binary = atob(padded)
      const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
      return new TextDecoder().decode(bytes)
    } catch {
      return undefined
    }
  }

  function codeFromUrl() {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get('code')
    return encoded ? decodeCode(encoded) : undefined
  }

  function restoreCodeFromUrl() {
    code = codeFromUrl() ?? playgroundExample?.code ?? starterCode
  }

  function storeCodeInUrl(script: string) {
    const url = new URL(window.location.href)
    if (!playgroundExample && script === starterCode) {
      url.hash = ''
    } else {
      url.hash = new URLSearchParams({ code: encodeCode(script) }).toString()
    }

    if (url.href !== window.location.href) {
      window.history.replaceState(window.history.state, '', url)
    }
  }

  onMount(() => {
    playgroundExample = getPlaygroundExample(
      new URL(window.location.href).searchParams.get('example'),
    )
    restoreCodeFromUrl()
    codeUrlReady = true
    window.addEventListener('hashchange', restoreCodeFromUrl)

    return () => window.removeEventListener('hashchange', restoreCodeFromUrl)
  })

  onDestroy(() => worker?.terminate())
</script>

<section class="playground" aria-label="Exstream playground">
  <header class="topbar">
    <a
      class="back"
      href={playgroundExample?.sourcePath ?? '/examples/'}
      aria-label={playgroundExample ? 'Back to lesson' : 'Back to examples'}>←</a
    >
    <strong>Exstream Playground</strong>
    <span class:active={isRunning} class:error={runState === 'error'} class="status">
      <i></i>{runState}
    </span>
    {#if errorMessage}
      <span class="error-message" role="alert">{errorMessage}</span>
    {/if}
    <div class="topbar-actions">
      {#if isRunning}
        <button type="button" class="secondary-button" onclick={stop}>Stop</button>
      {:else}
        <button type="button" class="secondary-button" onclick={reset}>Reset</button>
        <button type="button" class="run-button" onclick={run}>Run</button>
      {/if}
    </div>
  </header>

  <div class="workspace">
    <section class="editor-pane" aria-label="Playground editor">
      <header class="pane-bar editor-tabs-bar">
        <div class="editor-tabs" role="tablist" aria-label="Playground editor views">
          <button
            type="button"
            id="code-tab"
            role="tab"
            class:active={editorTab === 'code'}
            aria-selected={editorTab === 'code'}
            aria-controls="code-panel"
            onclick={() => (editorTab = 'code')}>pipeline.js</button
          >
          {#if playgroundExample}
            <button
              type="button"
              id="description-tab"
              role="tab"
              class:active={editorTab === 'description'}
              aria-selected={editorTab === 'description'}
              aria-controls="description-panel"
              onclick={() => (editorTab = 'description')}>README.md</button
            >
          {/if}
        </div>
        {#if editorTab === 'description' && playgroundExample}
          <a class="lesson-link" href={playgroundExample.sourcePath}>Lesson ↗</a>
        {:else}
          <span>⌘/Ctrl + Enter</span>
        {/if}
      </header>
      {#if editorTab === 'description' && playgroundExample}
        {@const Description = playgroundExample.description}
        <div
          id="description-panel"
          class="playground-description"
          role="tabpanel"
          aria-labelledby="description-tab"
        >
          <Description />
        </div>
      {:else}
        <div id="code-panel" class="code-panel" role="tabpanel" aria-labelledby="code-tab">
          <label class="sr-only" for="playground-editor">Pipeline JavaScript</label>
          <textarea
            id="playground-editor"
            bind:value={code}
            spellcheck="false"
            autocapitalize="off"
            autocomplete="off"
            onkeydown={handleEditorKeydown}></textarea>
        </div>
      {/if}
    </section>

    <div class="runtime-pane">
      <PlaygroundGraph nodes={graphNodes} edges={graphEdges} />

      <section class="runtime-dock" aria-label="Pipeline output">
        <header class="pane-bar runtime-tabs-bar">
          <div class="runtime-tabs" role="tablist" aria-label="Pipeline output views">
            <button
              type="button"
              id="destinations-tab"
              role="tab"
              class:active={runtimeTab === 'destinations'}
              aria-selected={runtimeTab === 'destinations'}
              aria-controls="destinations-panel"
              onclick={() => (runtimeTab = 'destinations')}
            >
              Destinations <span>{destinations.length}</span>
            </button>
            <button
              type="button"
              id="console-tab"
              role="tab"
              class:active={runtimeTab === 'console'}
              aria-selected={runtimeTab === 'console'}
              aria-controls="console-panel"
              onclick={() => (runtimeTab = 'console')}
            >
              Console <span>{consoleEntries.length}</span>
            </button>
          </div>
          {#if runtimeTab === 'destinations'}
            <span>{destinations.length} from script</span>
          {:else}
            <button
              type="button"
              class="clear-console"
              onclick={clearConsole}
              disabled={consoleEntries.length === 0}>Clear</button
            >
          {/if}
        </header>

        {#if runtimeTab === 'destinations'}
          <div
            id="destinations-panel"
            class="destination-grid"
            role="tabpanel"
            aria-labelledby="destinations-tab"
            aria-live="polite"
          >
            {#each destinations as destination (destination.id)}
              <article class="destination-card">
                <header>
                  <strong class="destination-name">{destination.name}</strong>
                  <span class:open={destination.state === 'open'} class="destination-state">
                    {destination.count.toLocaleString('en')} · {destination.state}
                  </span>
                </header>

                <div class="destination-controls">
                  <label>
                    <span>Speed</span>
                    <input
                      type="range"
                      min="0"
                      max={destinationSpeeds.length - 1}
                      step="1"
                      value={destinationSpeedIndex(destination.delay)}
                      oninput={(event) => changeDestinationSpeed(destination, event)}
                      aria-label={`Writer speed for ${destination.name}`}
                      aria-valuetext={formatSpeed(destination.delay)}
                    />
                    <output>{formatSpeed(destination.delay)}</output>
                  </label>
                  <label>
                    <span>Rows</span>
                    <input
                      class="buffer-input"
                      type="number"
                      min="1"
                      max="100"
                      bind:value={destination.bufferSize}
                      disabled={isRunning}
                      aria-label={`Visible rows for ${destination.name}`}
                    />
                  </label>
                </div>

                <ol style={`--visible-rows:${destination.bufferSize}`}>
                  {#each destination.values as value, index}
                    <li>
                      <span>{destination.count - destination.values.length + index + 1}</span>
                      <details class="destination-row">
                        <summary title="Expand row">
                          <pre>{formatValue(value)}</pre>
                        </summary>
                      </details>
                    </li>
                  {:else}
                    <li class="empty-row">
                      Waiting for <code>destination('{destination.name}')</code>
                    </li>
                  {/each}
                </ol>
              </article>
            {:else}
              <div class="empty-destinations">
                Add <code>destination('name')</code> to the script.
              </div>
            {/each}
          </div>
        {:else}
          <div
            id="console-panel"
            class="console-output"
            role="tabpanel"
            aria-labelledby="console-tab"
            bind:this={consoleOutput}
          >
            {#each consoleEntries as entry (entry.id)}
              <div
                class:error={entry.level === 'error'}
                class:warn={entry.level === 'warn'}
                class="console-line"
              >
                <span>{formatConsoleTime(entry.elapsed)}</span>
                <strong>{entry.level}</strong>
                <pre>{entry.message}</pre>
              </div>
            {:else}
              <div class="console-empty">
                Console output will appear here. Try <code>console.log('hello')</code>.
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>
  </div>
</section>

<style>
  .playground {
    --pg-shell: var(--page);
    --pg-toolbar: var(--surface);
    --pg-panel: var(--surface);
    --pg-panel-muted: color-mix(in srgb, var(--surface) 82%, var(--page));
    --pg-panel-raised: var(--surface-strong);
    --pg-editor: color-mix(in srgb, var(--surface) 68%, var(--page));
    --pg-graph: color-mix(in srgb, var(--surface) 72%, var(--page));
    --pg-ink: var(--ink);
    --pg-ink-soft: color-mix(in srgb, var(--ink) 78%, var(--surface));
    --pg-muted: var(--ink-soft);
    --pg-dim: color-mix(in srgb, var(--ink-soft) 76%, var(--surface));
    --pg-line: var(--line);
    --pg-line-subtle: color-mix(in srgb, var(--line) 62%, transparent);
    --pg-line-strong: color-mix(in srgb, var(--line) 76%, var(--ink-soft));
    --pg-line-hover: color-mix(in srgb, var(--line) 45%, var(--ink-soft));
    --pg-edge: color-mix(in srgb, var(--ink-soft) 68%, var(--line));
    --pg-edge-closed: color-mix(in srgb, var(--line) 82%, var(--ink-soft));
    --pg-badge: color-mix(in srgb, var(--surface) 88%, var(--ink));
    --pg-switch: color-mix(in srgb, var(--ink-soft) 62%, var(--surface));
    --pg-accent: var(--accent);
    --pg-success: color-mix(in srgb, var(--success) 58%, var(--ink));
    --pg-success-ink: color-mix(in srgb, var(--success) 68%, var(--ink));
    --pg-success-border: color-mix(in srgb, var(--success) 72%, var(--ink));
    --pg-danger-ink: color-mix(in srgb, var(--accent) 72%, var(--ink));
    --pg-danger-border: color-mix(in srgb, var(--accent) 62%, var(--line));
    --pg-warning: color-mix(in srgb, #e2a931 70%, var(--ink));
    --pg-purple: color-mix(in srgb, #9b72e6 72%, var(--ink));
    --pg-shadow: var(--shadow);

    display: grid;
    width: 100%;
    height: 100%;
    min-height: 0;
    grid-template-rows: 3.35rem minmax(0, 1fr);
    overflow: hidden;
    background: var(--pg-shell);
    color: var(--pg-ink);
  }

  .topbar {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid var(--pg-line);
    background: var(--pg-toolbar);
    padding: 0 0.7rem;
  }

  .back {
    display: grid;
    width: 2rem;
    height: 2rem;
    place-items: center;
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.45rem;
    color: var(--pg-muted);
    text-decoration: none;
  }

  .topbar > strong {
    white-space: nowrap;
    font-size: 0.82rem;
    letter-spacing: -0.01em;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid var(--pg-line-strong);
    border-radius: 999px;
    color: var(--pg-dim);
    padding: 0.22rem 0.48rem;
    font: 0.62rem var(--font-mono);
  }

  .status i {
    width: 0.42rem;
    height: 0.42rem;
    border-radius: 50%;
    background: var(--pg-switch);
  }

  .status.active {
    border-color: var(--pg-success-border);
    color: var(--pg-success-ink);
  }

  .status.active i {
    background: var(--pg-success);
    box-shadow: 0 0 0 0.2rem color-mix(in srgb, var(--pg-success) 16%, transparent);
  }

  .status.error,
  .error-message {
    color: var(--pg-danger-ink);
  }

  .status.error i {
    background: var(--pg-accent);
  }

  .error-message {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 0.65rem var(--font-mono);
  }

  .topbar-actions {
    display: flex;
    gap: 0.45rem;
    margin-left: auto;
  }

  .topbar button {
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.45rem;
    padding: 0.38rem 0.68rem;
    font-size: 0.7rem;
    font-weight: 720;
    cursor: pointer;
  }

  .topbar button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .secondary-button {
    background: transparent;
    color: var(--pg-ink-soft);
  }

  .run-button {
    border-color: var(--accent) !important;
    background: var(--accent);
    color: white;
  }

  .workspace {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-columns: minmax(25rem, 38%) minmax(0, 1fr);
  }

  .editor-pane {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: 2.65rem minmax(0, 1fr);
    border-right: 1px solid var(--pg-line);
    background: var(--pg-shell);
  }

  .pane-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--pg-line);
    padding: 0 0.85rem;
    font: 0.7rem var(--font-mono);
  }

  .pane-bar span {
    color: var(--pg-dim);
  }

  .editor-tabs-bar {
    padding-left: 0;
  }

  .editor-tabs {
    display: flex;
    align-self: stretch;
  }

  .editor-tabs button {
    position: relative;
    border: 0;
    background: transparent;
    color: var(--pg-dim);
    padding: 0 0.85rem;
    font: inherit;
    cursor: pointer;
  }

  .editor-tabs button::after {
    position: absolute;
    right: 0.75rem;
    bottom: -1px;
    left: 0.75rem;
    height: 2px;
    background: transparent;
    content: '';
  }

  .editor-tabs button.active {
    color: var(--pg-ink);
  }

  .editor-tabs button.active::after {
    background: var(--accent);
  }

  .lesson-link {
    color: var(--pg-success-ink);
    margin-right: 0.85rem;
    font-size: 0.62rem;
    text-decoration: none;
  }

  .code-panel {
    min-width: 0;
    min-height: 0;
  }

  textarea {
    width: 100%;
    height: 100%;
    min-height: 0;
    resize: none;
    border: 0;
    outline: 0;
    background: var(--pg-editor);
    color: var(--pg-ink);
    padding: 1rem;
    font: 0.78rem/1.65 var(--font-mono);
    tab-size: 2;
  }

  textarea:focus-visible {
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  .playground-description {
    min-width: 0;
    min-height: 0;
    overflow: auto;
    background: var(--pg-editor);
    padding: clamp(1.2rem, 4vw, 2.2rem);
  }

  .playground-description :global(h1) {
    max-width: 16ch;
    margin: 0 0 1rem;
    color: var(--pg-ink);
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    letter-spacing: -0.045em;
    line-height: 1.05;
  }

  .playground-description :global(p),
  .playground-description :global(li) {
    color: var(--pg-muted);
    font-size: 0.78rem;
    line-height: 1.7;
  }

  .playground-description :global(p) {
    margin: 0 0 1rem;
  }

  .playground-description :global(ul),
  .playground-description :global(ol) {
    margin: 0 0 1rem;
    padding-left: 1.2rem;
  }

  .playground-description :global(code) {
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.25rem;
    background: var(--pg-panel);
    color: var(--pg-ink-soft);
    padding: 0.08rem 0.28rem;
    font: 0.9em var(--font-mono);
  }

  .playground-description :global(strong) {
    color: var(--pg-ink);
  }

  .runtime-pane {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: minmax(0, 0.82fr) minmax(0, 1.18fr);
  }

  .runtime-dock {
    display: grid;
    min-height: 0;
    grid-template-rows: 2.65rem minmax(0, 1fr);
    background: var(--pg-panel-muted);
  }

  .runtime-tabs-bar {
    padding-left: 0;
  }

  .runtime-tabs {
    display: flex;
    align-self: stretch;
  }

  .runtime-tabs button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border: 0;
    background: transparent;
    color: var(--pg-dim);
    padding: 0 0.85rem;
    font: inherit;
    cursor: pointer;
  }

  .runtime-tabs button::after {
    position: absolute;
    right: 0.75rem;
    bottom: -1px;
    left: 0.75rem;
    height: 2px;
    background: transparent;
    content: '';
  }

  .runtime-tabs button.active {
    color: var(--pg-ink);
  }

  .runtime-tabs button.active::after {
    background: var(--accent);
  }

  .runtime-tabs button span {
    border-radius: 999px;
    background: var(--pg-badge);
    color: var(--pg-dim);
    padding: 0.08rem 0.32rem;
    font-size: 0.55rem;
  }

  .clear-console {
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.35rem;
    background: transparent;
    color: var(--pg-muted);
    margin-right: 0.7rem;
    padding: 0.25rem 0.5rem;
    font: 0.58rem var(--font-mono);
    cursor: pointer;
  }

  .clear-console:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .console-output {
    min-width: 0;
    min-height: 0;
    overflow: auto;
    background: var(--pg-editor);
    padding: 0.45rem 0;
  }

  .console-line {
    display: grid;
    grid-template-columns: 4.2rem 3.2rem minmax(0, 1fr);
    align-items: start;
    border-bottom: 1px solid var(--pg-line-subtle);
    padding: 0.36rem 0.7rem;
    font: 0.6rem/1.5 var(--font-mono);
  }

  .console-line > span {
    color: var(--pg-dim);
  }

  .console-line > strong {
    color: var(--pg-muted);
    font: inherit;
    text-transform: uppercase;
  }

  .console-line pre {
    overflow-wrap: anywhere;
    margin: 0;
    color: var(--pg-ink-soft);
    white-space: pre-wrap;
    font: inherit;
  }

  .console-line.warn > strong,
  .console-line.warn pre {
    color: var(--pg-warning);
  }

  .console-line.error > strong,
  .console-line.error pre {
    color: var(--pg-danger-ink);
  }

  .console-empty {
    display: grid;
    min-height: 100%;
    place-items: center;
    color: var(--pg-dim);
    padding: 1rem;
    font: 0.66rem var(--font-mono);
  }

  .console-empty code {
    color: var(--pg-muted);
  }

  .destination-grid {
    display: grid;
    min-height: 0;
    grid-auto-columns: minmax(20rem, 1fr);
    grid-auto-flow: column;
    gap: 0.7rem;
    overflow: auto;
    padding: 0.7rem;
  }

  .destination-card {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: auto auto minmax(0, 1fr);
    overflow: hidden;
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.65rem;
    background: var(--pg-panel);
  }

  .destination-card > header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.55rem;
    border-bottom: 1px solid var(--pg-line);
    padding: 0.5rem 0.6rem;
  }

  .destination-name {
    overflow: hidden;
    color: var(--pg-ink);
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 0.7rem var(--font-mono);
  }

  .destination-state {
    color: var(--pg-dim);
    font: 0.58rem var(--font-mono);
  }

  .destination-state.open {
    color: var(--pg-success);
  }

  .destination-controls {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    border-bottom: 1px solid var(--pg-line);
    padding: 0.45rem 0.6rem;
  }

  .destination-controls label {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.4rem;
    color: var(--pg-dim);
    font: 0.58rem var(--font-mono);
  }

  .destination-controls label:first-child {
    flex: 1;
  }

  .destination-controls input[type='range'] {
    min-width: 3.5rem;
    flex: 1;
    accent-color: var(--accent);
  }

  .destination-controls output {
    min-width: 4.8rem;
    color: var(--pg-ink-soft);
    text-align: right;
  }

  .buffer-input {
    width: 3rem;
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.3rem;
    background: var(--pg-panel-muted);
    color: var(--pg-ink);
    padding: 0.18rem 0.28rem;
    font: 0.62rem var(--font-mono);
  }

  .destination-card ol {
    min-height: 0;
    overflow: auto;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .destination-card li {
    display: grid;
    grid-template-columns: 2.3rem minmax(0, 1fr);
    border-bottom: 1px solid var(--pg-line-subtle);
  }

  .destination-card li > span {
    padding: 0.42rem 0.35rem;
    color: var(--pg-dim);
    text-align: right;
    font: 0.55rem/1.45 var(--font-mono);
  }

  .destination-row {
    min-width: 0;
  }

  .destination-row summary {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) 1.2rem;
    align-items: start;
    cursor: pointer;
    list-style: none;
  }

  .destination-row summary::-webkit-details-marker {
    display: none;
  }

  .destination-row summary::after {
    color: var(--pg-dim);
    padding-top: 0.42rem;
    content: '›';
    font: 0.7rem/1 var(--font-mono);
    text-align: center;
    transition: transform 120ms ease;
  }

  .destination-row[open] summary::after {
    transform: rotate(90deg);
  }

  .destination-card pre {
    min-width: 0;
    overflow-x: auto;
    margin: 0;
    padding: 0.42rem 0.55rem;
    color: var(--pg-ink-soft);
    white-space: nowrap;
    scrollbar-width: thin;
    font: 0.58rem/1.45 var(--font-mono);
  }

  .destination-row[open] pre {
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .destination-card .empty-row {
    display: block;
    border: 0;
    color: var(--pg-dim);
    padding: 1rem;
    font: 0.62rem var(--font-mono);
  }

  .empty-row code {
    color: var(--pg-muted);
  }

  .empty-destinations {
    align-self: center;
    border: 1px dashed var(--pg-line-strong);
    border-radius: 0.65rem;
    background: transparent;
    color: var(--pg-muted);
    padding: 2rem;
    font: 0.7rem var(--font-mono);
  }

  .empty-destinations code {
    color: var(--pg-ink-soft);
  }

  @media (max-width: 900px) {
    .playground {
      height: 100%;
      min-height: 0;
      overflow: auto;
    }

    .workspace {
      grid-template-columns: 1fr;
    }

    .editor-pane {
      height: 70dvh;
      border-right: 0;
      border-bottom: 1px solid var(--pg-line);
    }

    .runtime-pane {
      height: max(50rem, 100%);
    }
  }

  @media (max-width: 620px) {
    .topbar > strong,
    .status,
    .error-message {
      display: none;
    }

    .topbar-actions {
      margin-left: auto;
    }

    .destination-grid {
      grid-auto-columns: minmax(18rem, 88vw);
    }
  }
</style>
