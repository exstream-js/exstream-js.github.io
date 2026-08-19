<script lang="ts">
  import CopyButton from './CopyButton.svelte'
  import Prism from 'prismjs'
  import 'prismjs/components/prism-bash'
  import 'prismjs/components/prism-markup'
  import 'prismjs/components/prism-javascript'

  type Runtime = 'node' | 'vite' | 'cdn'
  type Language = 'bash' | 'javascript' | 'markup'
  type Example = {
    label: string
    description: string
    setup?: string
    filename: string
    code: string
    language: Language
    run?: string
  }

  const dataUrl =
    'https://raw.githubusercontent.com/plotly/datasets/master/gapminderDataFiveYear.csv'

  const pipeline = `const response = await fetch(dataUrl)
if (!response.ok || !response.body) {
  throw new Error(\`Download failed: \${response.status}\`)
}

const countries = exstream(response.body)
  .csv({ header: true })
  .filter((row) => row.year === '2007')
  .map((row) => ({
    country: row.country,
    continent: row.continent,
    lifeExpectancy: Number(row.lifeExp),
  }))
  .take(8)`

  const browserDestination = `const output = document.querySelector('#app')
output.replaceChildren()

const destination = exstream
  .pipeline()
  .tap((row) => {
    const line = document.createElement('p')
    line.textContent = \`\${row.country}: \${row.lifeExpectancy} years\`
    output.append(line)
  })
  .drain()`

  const examples: Record<Runtime, Example> = {
    node: {
      label: 'Node.js',
      description: 'Fetch the CSV and write eight transformed records to a local JSON Lines file.',
      setup: `mkdir exstream-quickstart
cd exstream-quickstart
npm init -y
npm install exstream.js`,
      filename: 'index.mjs',
      code: `import { createWriteStream } from 'node:fs'
import exstream from 'exstream.js'

const dataUrl =
  '${dataUrl}'

${pipeline}

await countries
  .jsonlStringify()
  .pipeTo(createWriteStream('countries.jsonl'))

console.log('Wrote countries.jsonl')`,
      language: 'javascript',
      run: 'node index.mjs',
    },
    vite: {
      label: 'Browser + Vite',
      description: 'Replace the starter main.js; each transformed record is written into the page.',
      setup: `npm create vite@latest exstream-quickstart -- --template vanilla
cd exstream-quickstart
npm install exstream.js`,
      filename: 'src/main.js',
      code: `import exstream from 'exstream.js'

const dataUrl =
  '${dataUrl}'

${browserDestination}

${pipeline}

await countries.pipeTo(destination)`,
      language: 'javascript',
      run: 'npm run dev',
    },
    cdn: {
      label: 'Browser + CDN',
      description: 'Save one HTML file. No package installation or build step is required.',
      filename: 'index.html',
      code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Exstream quick start</title>
  </head>
  <body>
    <main id="app"></main>

    <script type="module">
      import exstream from 'https://cdn.jsdelivr.net/npm/exstream.js@1/dist/exstream.mjs'

      const dataUrl =
        '${dataUrl}'

      ${browserDestination.replaceAll('\n', '\n      ')}

      ${pipeline.replaceAll('\n', '\n      ')}

      await countries.pipeTo(destination)
    ${'</' + 'script>'}
  </body>
</html>`,
      language: 'markup',
    },
  }

  let runtime = $state<Runtime>('node')
  const example = $derived(examples[runtime])
  const highlightedCode = $derived(
    Prism.highlight(example.code, Prism.languages[example.language]!, example.language),
  )
  const highlightedSetup = $derived(
    example.setup ? Prism.highlight(example.setup, Prism.languages.bash!, 'bash') : '',
  )
  const highlightedRun = $derived(
    example.run ? Prism.highlight(example.run, Prism.languages.bash!, 'bash') : '',
  )
</script>

<section class="quick-start-tabs" aria-labelledby="quick-start-examples-title">
  <div class="quick-start-tabs-header">
    <div>
      <h2 id="quick-start-examples-title">Choose where to run it</h2>
      <p>{example.description}</p>
    </div>
    <div class="segmented-control" aria-label="Runtime">
      {#each Object.entries(examples) as [value, item]}
        <button
          type="button"
          class:active={runtime === value}
          aria-pressed={runtime === value}
          onclick={() => (runtime = value as Runtime)}>{item.label}</button
        >
      {/each}
    </div>
  </div>

  <div class="quick-start-steps">
    {#if example.setup}
      <div class="quick-start-step">
        <p><span>1</span> Set up the project</p>
        <div class="code-block-shell">
          <pre class="language-bash" data-copy-ready="true"><code class="language-bash"
              >{@html highlightedSetup}</code
            ></pre>
          <CopyButton text={example.setup} />
        </div>
      </div>
    {/if}

    <div class="quick-start-step">
      <p><span>{example.setup ? '2' : '1'}</span> Save as <code>{example.filename}</code></p>
      <div class="code-block-shell">
        <pre class={`language-${example.language}`} data-copy-ready="true"><code
            class={`language-${example.language}`}>{@html highlightedCode}</code
          ></pre>
        <CopyButton text={example.code} />
      </div>
    </div>

    {#if example.run}
      <div class="quick-start-step">
        <p><span>3</span> Run it</p>
        <div class="code-block-shell">
          <pre class="language-bash" data-copy-ready="true"><code class="language-bash"
              >{@html highlightedRun}</code
            ></pre>
          <CopyButton text={example.run} />
        </div>
      </div>
    {/if}
  </div>
</section>
