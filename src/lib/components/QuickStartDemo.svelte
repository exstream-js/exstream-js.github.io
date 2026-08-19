<script lang="ts">
  import exstream from 'exstream.js'

  type DemoState = 'idle' | 'running' | 'complete' | 'error'
  type Country = {
    country: string
    continent: string
    lifeExpectancy: number
  }

  const dataUrl =
    'https://raw.githubusercontent.com/plotly/datasets/master/gapminderDataFiveYear.csv'

  let status = $state<DemoState>('idle')
  let countries = $state<Country[]>([])
  let errorMessage = $state('')

  async function run() {
    status = 'running'
    countries = []
    errorMessage = ''

    try {
      const response = await fetch(dataUrl)
      if (!response.ok || !response.body) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const destination = new WritableStream<Country>({
        write(country) {
          countries = [...countries, country]
        },
      })

      await exstream(response.body)
        .csv({ header: true })
        .filter((row) => row.year === '2007')
        .map((row) => ({
          country: row.country ?? 'Unknown',
          continent: row.continent ?? 'Unknown',
          lifeExpectancy: Number(row.lifeExp),
        }))
        .take(8)
        .pipeTo(destination)

      status = 'complete'
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'The pipeline failed.'
      status = 'error'
    }
  }
</script>

<section class="quick-demo" aria-labelledby="quick-demo-title">
  <div class="quick-demo-header">
    <div>
      <h2 id="quick-demo-title">Run the browser pipeline here</h2>
      <p>
        The file is fetched and parsed when you press Run. Its records are written into this table.
      </p>
    </div>
    <button class="button" type="button" onclick={run} disabled={status === 'running'}>
      {status === 'running' ? 'Running…' : status === 'idle' ? 'Run' : 'Run again'}
    </button>
  </div>

  {#if errorMessage}
    <p class="quick-demo-error" role="alert">{errorMessage}</p>
  {/if}

  <div class="quick-demo-table-wrap">
    <table class="quick-demo-table">
      <thead>
        <tr>
          <th>Country</th>
          <th>Continent</th>
          <th>Life expectancy</th>
        </tr>
      </thead>
      <tbody aria-live="polite">
        {#each countries as country (country.country)}
          <tr>
            <td>{country.country}</td>
            <td>{country.continent}</td>
            <td>{country.lifeExpectancy.toFixed(1)} years</td>
          </tr>
        {:else}
          <tr>
            <td colspan="3"
              >{status === 'running' ? 'Reading the remote file…' : 'No records yet.'}</td
            >
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
