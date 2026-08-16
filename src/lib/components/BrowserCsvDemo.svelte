<script lang="ts">
  import exstream from 'exstream.js'

  const datasetUrl =
    'https://raw.githubusercontent.com/plotly/datasets/master/gapminderDataFiveYear.csv'
  const expectedRows = 1_704

  type DemoState = 'idle' | 'running' | 'complete' | 'cancelled' | 'error'
  type GapminderRow = {
    continent: string
    country: string
    gdpPerCapita: number
    lifeExpectancy: number
    population: number
    year: number
  }

  const sinkSpeeds = [
    { label: 'None', delay: 0 },
    { label: 'Low', delay: 25 },
    { label: 'Medium', delay: 75 },
    { label: 'High', delay: 200 },
  ] as const

  let status = $state<DemoState>('idle')
  let continent = $state('All')
  let writerDelay = $state<number>(sinkSpeeds[1].delay)
  let paused = $state(false)
  let rowsRead = $state(0)
  let rowsMatched = $state(0)
  let population = $state(0)
  let recentRows = $state<GapminderRow[]>([])
  let errorMessage = $state('')
  let controller: AbortController | undefined
  let releasePausedWrite: (() => void) | undefined

  const progress = $derived(Math.min(100, (rowsRead / expectedRows) * 100))
  const displayedStatus = $derived(paused && status === 'running' ? 'paused' : status)
  const formattedPopulation = $derived(
    new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(
      population,
    ),
  )

  function abortableDelay(milliseconds: number, signal: AbortSignal) {
    if (signal.aborted) return Promise.reject(signal.reason)
    if (milliseconds === 0) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(finish, milliseconds)

      function cleanup() {
        clearTimeout(timer)
        signal.removeEventListener('abort', abort)
      }

      function finish() {
        cleanup()
        resolve()
      }

      function abort() {
        cleanup()
        reject(signal.reason)
      }

      signal.addEventListener('abort', abort, { once: true })
    })
  }

  function waitWhilePaused(signal: AbortSignal) {
    if (signal.aborted) return Promise.reject(signal.reason)
    if (!paused) return Promise.resolve()

    return new Promise<void>((resolve, reject) => {
      function cleanup() {
        signal.removeEventListener('abort', abort)
        releasePausedWrite = undefined
      }

      function resume() {
        cleanup()
        resolve()
      }

      function abort() {
        cleanup()
        reject(signal.reason)
      }

      releasePausedWrite = resume
      signal.addEventListener('abort', abort, { once: true })
    })
  }

  function resumeWriter() {
    paused = false
    releasePausedWrite?.()
  }

  async function run() {
    controller?.abort()
    controller = new AbortController()
    const signal = controller.signal

    status = 'running'
    resumeWriter()
    rowsRead = 0
    rowsMatched = 0
    population = 0
    recentRows = []
    errorMessage = ''

    try {
      const response = await fetch(datasetUrl, { signal })
      if (!response.ok || !response.body) {
        throw new Error(`The dataset returned HTTP ${response.status}.`)
      }

      const rows = exstream(response.body)
        .csv({
          header: true,
          maxColumns: 12,
          maxRecordBytes: 16 * 1024,
        })
        .tap(() => rowsRead++)
        .map((row) => ({
          continent: row.continent ?? 'Unknown',
          country: row.country ?? 'Unknown',
          gdpPerCapita: Number(row.gdpPercap ?? 0),
          lifeExpectancy: Number(row.lifeExp ?? 0),
          population: Number(row.pop ?? 0),
          year: Number(row.year ?? 0),
        }))
        .filter((row) => row.year === 2007)
        .filter((row) => continent === 'All' || row.continent === continent)

      const destination = new WritableStream<GapminderRow>({
        async write(row) {
          await waitWhilePaused(signal)
          await abortableDelay(writerDelay, signal)

          rowsMatched++
          population += row.population
          recentRows = [row, ...recentRows].slice(0, 6)
        },
      })

      await rows.pipeTo(destination, { signal })

      status = 'complete'
    } catch (error) {
      if (signal.aborted) {
        status = 'cancelled'
        return
      }

      errorMessage = error instanceof Error ? error.message : 'The pipeline failed.'
      status = 'error'
    } finally {
      resumeWriter()
    }
  }

  function cancel() {
    controller?.abort()
  }

  function togglePause() {
    if (paused) resumeWriter()
    else paused = true
  }
</script>

<section class="demo" aria-labelledby="browser-demo-title">
  <div class="demo-toolbar">
    <div>
      <p class="eyebrow">Live browser pipeline</p>
      <h2 id="browser-demo-title">Stream 1,704 public CSV records.</h2>
      <p>
        Fetched from Plotly’s public dataset repository, parsed and filtered by Exstream in this
        tab.
      </p>
    </div>
    <a href={datasetUrl} target="_blank" rel="noreferrer">View source CSV ↗</a>
  </div>

  <div class="demo-controls">
    <label>
      <span>Continent</span>
      <select bind:value={continent} disabled={status === 'running'}>
        <option>All</option>
        <option>Africa</option>
        <option>Americas</option>
        <option>Asia</option>
        <option>Europe</option>
        <option>Oceania</option>
      </select>
    </label>
    <fieldset class="demo-speed">
      <legend>Writer delay</legend>
      <div class="demo-speed-options">
        {#each sinkSpeeds as speed}
          <button
            class:active={writerDelay === speed.delay}
            type="button"
            aria-pressed={writerDelay === speed.delay}
            onclick={() => (writerDelay = speed.delay)}
          >
            <strong>{speed.label}</strong>
            <small>{speed.delay} ms</small>
          </button>
        {/each}
      </div>
    </fieldset>
    {#if status === 'running'}
      <div class="demo-actions">
        <button class="button secondary" type="button" aria-pressed={paused} onclick={togglePause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button class="button secondary" type="button" onclick={cancel}>Cancel</button>
      </div>
    {:else}
      <button class="button" type="button" onclick={run}>
        {status === 'idle' ? 'Run pipeline' : 'Run again'}
      </button>
    {/if}
  </div>

  <div class="demo-progress" aria-hidden="true">
    <span style={`width: ${progress}%`}></span>
  </div>

  <div class="demo-stats" aria-live="polite">
    <div><span>State</span><strong>{displayedStatus}</strong></div>
    <div><span>Rows read</span><strong>{rowsRead.toLocaleString('en')}</strong></div>
    <div><span>2007 matches</span><strong>{rowsMatched.toLocaleString('en')}</strong></div>
    <div><span>Population</span><strong>{formattedPopulation}</strong></div>
  </div>

  {#if errorMessage}
    <p class="demo-error" role="alert">{errorMessage}</p>
  {/if}

  <div class="demo-table-wrap">
    <table class="demo-table">
      <caption class="sr-only">Most recently processed matching records</caption>
      <colgroup>
        <col class="demo-country" />
        <col class="demo-continent" />
        <col class="demo-life" />
        <col class="demo-gdp" />
      </colgroup>
      <thead>
        <tr>
          <th>Country</th>
          <th>Continent</th>
          <th>Life expectancy</th>
          <th>GDP per capita</th>
        </tr>
      </thead>
      <tbody>
        {#each recentRows as row (`${row.country}-${row.year}`)}
          <tr>
            <td>{row.country}</td>
            <td>{row.continent}</td>
            <td>{row.lifeExpectancy.toFixed(1)} years</td>
            <td>${Math.round(row.gdpPerCapita).toLocaleString('en')}</td>
          </tr>
        {:else}
          <tr>
            <td colspan="4">Run the pipeline to see records arrive.</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
