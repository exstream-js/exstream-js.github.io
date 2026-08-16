<script>
  import BrowserCsvDemo from '$lib/components/BrowserCsvDemo.svelte'
</script>

<svelte:head>
  <title>Browser CSV demo — Exstream</title>
  <meta name="description" content="Run an Exstream CSV pipeline against a public dataset directly in your browser." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/examples/browser-csv/" />
</svelte:head>

<p class="eyebrow">Interactive example · Browser</p>

# The source is a real `fetch()`

<p class="lead">Run Exstream against a public CSV without a server, upload, or playground sandbox. Your browser fetches the file as a Web ReadableStream and the slow consumer controls the pace.</p>

<BrowserCsvDemo />

## The pipeline behind the demo

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

for await (const row of rows.toAsyncIterator({ signal })) {
  await slowDestination.write(row)
}
```

The delay in the demo stands in for a slow destination. Because the loop waits before pulling again, pressure travels through the CSV parser to `response.body`. Turn the delay off and the same pipeline completes immediately.

## Why a public static file

The dataset is versioned in [Plotly’s public datasets repository](https://github.com/plotly/datasets), available over HTTPS, and served by GitHub with cross-origin access enabled. It makes the example reproducible without API keys or a third-party account.

Public APIs can also be useful, but rate limits, authentication, changing response schemas, and unreliable CORS make them worse as the canonical first demo. Later examples can use paginated APIs and live event sources where those failure modes are the lesson rather than accidental noise.
