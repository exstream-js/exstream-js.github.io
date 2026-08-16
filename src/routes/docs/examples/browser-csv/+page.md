<script>
  import BrowserCsvDemo from '$lib/components/BrowserCsvDemo.svelte'
</script>

<svelte:head>
  <title>Browser CSV demo — Exstream</title>
  <meta name="description" content="Run an Exstream CSV pipeline against a public dataset directly in your browser." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/examples/browser-csv/" />
</svelte:head>

<p class="eyebrow">Guide · Browser</p>

# Fetch a large CSV

<p class="lead">Run Exstream against a public CSV without a server, upload, or playground sandbox. Your browser fetches the file as a Web ReadableStream and a controllable WritableStream sets the pace.</p>

<BrowserCsvDemo />

## Demo pipeline

```javascript
const response = await fetch(datasetUrl, { signal })

const rows = exstream(response.body)
  .csv({
    header: true,
    maxColumns: 12,
    maxRecordBytes: 16 * 1024,
  })
  .map((row) => ({
    ...row,
    population: Number(row.pop),
    year: Number(row.year),
  }))
  .filter((row) => row.year === 2007)

const destination = new WritableStream({
  async write(row) {
    await waitWhilePaused(signal)
    await delay(writerDelay, signal)
    render(row)
  },
})

await rows.pipe(destination, { signal })
```

The destination's `write()` promise is the backpressure boundary. While it is delayed or paused, Exstream does not pull the next matching record; pressure travels through the CSV parser to `response.body`. Change the writer delay while the pipeline is running, pause it completely, or remove the delay to let it finish immediately.

## Why a static file

The dataset is versioned in [Plotly’s public datasets repository](https://github.com/plotly/datasets), available over HTTPS, and served by GitHub with cross-origin access enabled. It makes the example reproducible without API keys or a third-party account.

Public APIs can also be useful, but rate limits, authentication, changing response schemas, and unreliable CORS make them worse as the canonical first demo. Later examples can use paginated APIs and live event sources where those failure modes are the lesson rather than accidental noise.
