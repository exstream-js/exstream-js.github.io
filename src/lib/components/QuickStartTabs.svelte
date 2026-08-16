<script lang="ts">
  import Prism from 'prismjs'
  import 'prismjs/components/prism-javascript'
  import 'prismjs/components/prism-typescript'

  type Runtime = 'node' | 'browser'
  type Language = 'javascript' | 'typescript'

  const snippets: Record<`${Runtime}-${Language}`, string> = {
    'node-javascript': `import { createReadStream, createWriteStream } from 'node:fs'
import exstream from 'exstream.js'

await exstream(createReadStream('./orders.csv'))
  .csv({ header: true })
  .map((order) => ({
    ...order,
    total: Number(order.total),
  }))
  .filter((order) => order.status === 'active')
  .jsonlStringify()
  .pipeTo(createWriteStream('./active-orders.jsonl'))`,
    'node-typescript': `import { createReadStream, createWriteStream } from 'node:fs'
import exstream from 'exstream.js'

type Order = Record<string, string> & { total: string }

await exstream(createReadStream('./orders.csv'))
  .csv({ header: true })
  .map((order: Order) => ({
    ...order,
    total: Number(order.total),
  }))
  .filter((order) => order.status === 'active')
  .jsonlStringify()
  .pipeTo(createWriteStream('./active-orders.jsonl'))`,
    'browser-javascript': `import exstream from 'exstream.js'

const response = await fetch('/orders.csv')
const destination = new WritableStream({
  write(chunk) {
    console.log(chunk)
  },
})

await exstream(response.body)
  .csv({ header: true })
  .map((order) => ({
    ...order,
    total: Number(order.total),
  }))
  .filter((order) => order.status === 'active')
  .jsonlStringify()
  .pipeTo(destination)`,
    'browser-typescript': `import exstream from 'exstream.js'

const response = await fetch('/orders.csv')
const destination = new WritableStream<string | Uint8Array>({
  write(chunk) {
    console.log(chunk)
  },
})

await exstream(response.body)
  .csv({ header: true })
  .map((order) => ({
    ...order,
    total: Number(order.total),
  }))
  .filter((order) => order.status === 'active')
  .jsonlStringify()
  .pipeTo(destination)`,
  }

  let runtime = $state<Runtime>('node')
  let language = $state<Language>('javascript')

  const code = $derived(snippets[`${runtime}-${language}`])
  const highlighted = $derived(Prism.highlight(code, Prism.languages[language]!, language))
</script>

<section class="quick-start-tabs" aria-labelledby="first-pipeline-title">
  <div class="quick-start-tabs-header">
    <div>
      <p class="eyebrow">Choose your runtime</p>
      <h2 id="first-pipeline-title">One pipeline, two environments.</h2>
    </div>
    <div class="snippet-selectors">
      <div class="segmented-control" aria-label="Runtime">
        <button
          type="button"
          class:active={runtime === 'node'}
          aria-pressed={runtime === 'node'}
          onclick={() => (runtime = 'node')}>Node.js</button
        >
        <button
          type="button"
          class:active={runtime === 'browser'}
          aria-pressed={runtime === 'browser'}
          onclick={() => (runtime = 'browser')}>Browser</button
        >
      </div>
      <div class="segmented-control" aria-label="Language">
        <button
          type="button"
          class:active={language === 'javascript'}
          aria-pressed={language === 'javascript'}
          onclick={() => (language = 'javascript')}>JavaScript</button
        >
        <button
          type="button"
          class:active={language === 'typescript'}
          aria-pressed={language === 'typescript'}
          onclick={() => (language = 'typescript')}>TypeScript</button
        >
      </div>
    </div>
  </div>

  <pre class={`language-${language}`}><code class={`language-${language}`}>{@html highlighted}</code
    ></pre>
  <p class="snippet-caption">
    The source and destination change with the runtime. Parsing, transformation, and flow control do
    not.
  </p>
</section>
