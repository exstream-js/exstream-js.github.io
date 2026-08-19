<script>
  import QuickStartDemo from '$lib/components/QuickStartDemo.svelte'
  import QuickStartTabs from '$lib/components/QuickStartTabs.svelte'
</script>

<svelte:head>
  <title>Quick start — Exstream</title>
  <meta name="description" content="Fetch, transform, and write a remote file with Exstream in Node.js or the browser." />
  <link rel="canonical" href="https://exstream-js.github.io/quick-start/" />
</svelte:head>

# Quick start

<p class="lead">Fetch a remote CSV, parse it while it arrives, transform its records, and write the result to a destination.</p>

<QuickStartTabs />

The Node.js example writes JSON Lines to a file. The browser examples write the same records into the page. Only the source and destination change.

<QuickStartDemo />

## What the pipeline does

`fetch()` provides the response body as a stream. `csv()` converts incoming bytes into rows, `filter()` and `map()` process each row, and `take()` stops after eight results. The terminal `pipeTo()` call starts the work and waits for the destination to finish.

The mapping here is synchronous. When each record needs a database query, HTTP request, or other asynchronous work, use [`mapAsync()`](/docs/learn/async-work/) with bounded concurrency.

## Continue

- Start with [the pipeline model](/docs/learn/pipeline-model/) to understand sources, transformations, branches, and destinations.
- Read [sources](/docs/learn/sources/) and the [`csv()` reference](/docs/reference/csv/) for other inputs and parsing options.
- See [transform data](/docs/learn/transform-data/) for reusable pipelines and the complete transformation reference.
- Read [consume a pipeline](/docs/learn/consume/) for terminal operations and destination adapters.
