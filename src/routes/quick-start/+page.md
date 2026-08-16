<script>
  import QuickStartDemo from '$lib/components/QuickStartDemo.svelte'
  import QuickStartTabs from '$lib/components/QuickStartTabs.svelte'
</script>

<svelte:head>
  <title>Quick start — Exstream</title>
  <meta name="description" content="Build and run a bounded Exstream pipeline in Node.js or the browser." />
  <link rel="canonical" href="https://exstream-js.github.io/quick-start/" />
</svelte:head>

<p class="eyebrow">Start here · 5 minutes</p>

# Build one useful pipeline

<p class="lead">Read records, transform them while they flow, and write the result without collecting the whole input first.</p>

## Install

For Node.js, install the package. Exstream requires Node.js 22 or newer.

```shell
npm install exstream.js
```

In a browser project, install the same package through your bundler. The default import selects the portable browser runtime automatically.

<QuickStartTabs />

## What the pipeline does

The example connects a real source and destination, parses CSV incrementally, converts `total` to a number, keeps active orders, and serializes each result as JSON Lines.

Nothing runs just because the chain exists. `pipeTo()` is the terminal operation: it starts demand and settles only after the destination finishes.

<div class="contract-grid">
  <div><strong>Memory</strong><span>No complete-file collection</span></div>
  <div><strong>Flow</strong><span>The destination sets the pace</span></div>
  <div><strong>Transform</strong><span>One record at a time</span></div>
  <div><strong>Completion</strong><span>Explicit terminal promise</span></div>
</div>

<QuickStartDemo />

## Add bounded asynchronous work

When a record needs I/O, use `mapAsync()` and state the contract you need:

```javascript
const enriched = orders.mapAsync(loadCustomer, {
  concurrency: 8,
  ordered: true,
  retry: 2,
  timeout: 5_000,
})
```

At most eight calls are active, results preserve input order, and cancelled work receives an `AbortSignal` through the record context.

## Handle the terminal failure

```javascript
try {
  await pipeline.pipeTo(destination)
} catch (error) {
  const { origin, stage } = exstream.errorInfo(error)
  console.error(`Pipeline failed in ${origin}:${stage ?? 'unknown'}`, error)
}
```

Recoverable record errors and fatal graph failures are separate policies. The quick start stops at the terminal boundary; the error guide explains routing, skipping, and promotion.

## Continue from here

- Understand the [pipeline model](/docs/learn/pipeline-model/).
- Learn how [backpressure](/docs/concepts/backpressure/) keeps the graph bounded.
- Run the full [browser CSV guide](/docs/examples/browser-csv/).
- Check [when not to use Exstream](/docs/project/when-not-to-use/) before making the pipeline more elaborate.
