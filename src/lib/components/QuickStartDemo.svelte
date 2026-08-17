<script lang="ts">
  import exstream from 'exstream.js'
  import Prism from 'prismjs'
  import 'prismjs/components/prism-csv'
  import 'prismjs/components/prism-json'

  type Transform = 'active' | 'high-value' | 'normalize'
  type Format = 'jsonl' | 'csv' | 'json'
  type Order = {
    id: string
    customer: string
    status: 'active' | 'cancelled'
    total: number
  }

  const orders: Order[] = [
    { id: 'A-104', customer: 'Ada Foods', status: 'active', total: 1840 },
    { id: 'A-105', customer: 'Northwind', status: 'cancelled', total: 620 },
    { id: 'A-106', customer: 'Orbit Labs', status: 'active', total: 3420 },
    { id: 'A-107', customer: 'Morrow Studio', status: 'active', total: 780 },
  ]

  let transform = $state<Transform>('active')
  let format = $state<Format>('jsonl')
  let output = $state('')
  const outputLanguage = $derived(format === 'csv' ? 'csv' : 'json')
  const highlightedOutput = $derived(
    Prism.highlight(output, Prism.languages[outputLanguage]!, outputLanguage),
  )

  function joinChunks(chunks: Array<string | Uint8Array>) {
    const decoder = new TextDecoder()
    return chunks
      .map((chunk) => (typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true })))
      .join('')
  }

  async function render(selectedTransform: Transform, selectedFormat: Format) {
    let pipeline = exstream(orders)
    const chunks: Array<string | Uint8Array> = []
    const destination = new WritableStream<string | Uint8Array>({
      write(chunk) {
        chunks.push(chunk)
      },
    })

    if (selectedTransform === 'active') {
      pipeline = pipeline.filter((order) => order.status === 'active')
    } else if (selectedTransform === 'high-value') {
      pipeline = pipeline.filter((order) => order.total >= 1_000)
    } else {
      pipeline = pipeline.map((order) => ({
        ...order,
        customer: order.customer.toUpperCase(),
        total: Math.round(order.total),
      }))
    }

    if (selectedFormat === 'csv') {
      await pipeline.csvStringify({ header: true }).pipeTo(destination)
    } else if (selectedFormat === 'json') {
      await pipeline.jsonStringify().pipeTo(destination)
    } else {
      await pipeline.jsonlStringify().pipeTo(destination)
    }

    output = joinChunks(chunks)
  }

  $effect(() => {
    void render(transform, format)
  })
</script>

<section class="quick-demo" aria-labelledby="quick-demo-title">
  <div class="quick-demo-header">
    <div>
      <p class="eyebrow">Try one change</p>
      <h2 id="quick-demo-title">The result follows the pipeline.</h2>
      <p>Change a transformation or output format. The bundled browser runtime runs it here.</p>
    </div>
    <div class="quick-demo-controls">
      <label>
        <span>Transform</span>
        <select bind:value={transform}>
          <option value="active">Active orders</option>
          <option value="high-value">Orders ≥ $1,000</option>
          <option value="normalize">Normalize customers</option>
        </select>
      </label>
      <label>
        <span>Output format</span>
        <select bind:value={format}>
          <option value="jsonl">JSON Lines</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </label>
    </div>
  </div>
  <pre class={`language-${outputLanguage}`} aria-live="polite"><code
      class={`language-${outputLanguage}`}>{@html highlightedOutput}</code
    ></pre>
</section>
