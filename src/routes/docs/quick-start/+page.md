<svelte:head>
  <title>Quick start — Exstream</title>
  <meta name="description" content="Install Exstream and build a bounded JavaScript ETL pipeline in five minutes." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/quick-start/" />
</svelte:head>

<p class="eyebrow">Start here · 5 minutes</p>

# Your first bounded pipeline

<p class="lead">Turn a source into records, transform them, and consume the result. The consumer decides how fast the pipeline moves.</p>

## 1. Install

Exstream requires Node.js 22 or newer.

```shell
npm install exstream.js
```

## 2. Transform a synchronous source

```javascript
import exstream from 'exstream.js'

const values = exstream([1, 2, 3, 4])
  .map((value) => value * 2)
  .filter((value) => value > 4)

for (const value of values.values()) {
  console.log(value)
}
```

This prints `6` and `8`. `map()` and `filter()` stay on Exstream's synchronous path.

## 3. Bound asynchronous work

Use `mapAsync()` when each record needs I/O. State the concurrency and ordering you want:

```javascript
const orders = exstream(orderIds).mapAsync(
  async (id, context) => {
    const response = await fetch(`https://api.example.com/orders/${id}`, {
      signal: context.signal,
    })

    return response.json()
  },
  {
    concurrency: 8,
    ordered: true,
    retry: 2,
    timeout: 5_000,
  },
)

for await (const order of orders.toAsyncIterator()) {
  await saveOrder(order)
}
```

At most eight lookups are active. Results keep input order. The context signal is cancelled when work for the record is no longer useful.

<div class="contract-grid">
  <div><strong>Concurrency</strong><span>8 active records</span></div>
  <div><strong>Order</strong><span>Input order preserved</span></div>
  <div><strong>Retry</strong><span>2 retries per record</span></div>
  <div><strong>Cancellation</strong><span>Passed as AbortSignal</span></div>
</div>

## 4. Parse without collecting the file

CSV input may arrive as strings, buffers, or chunks. Records are emitted incrementally:

```javascript
const rows = exstream(csvChunks).csv({
  header: true,
  maxColumns: 100,
  maxRecordBytes: 8 * 1024 * 1024,
})

for await (const row of rows.toAsyncIterator()) {
  await writeRow(row)
}
```

The limits are part of the example because unbounded inputs should not get an unbounded parser by accident.

## 5. Make the destination terminal

Use `pipeTo()` when writing is the operation that completes the graph:

```javascript
await exstream(input).csv({ header: true }).map(normalize).jsonlStringify().pipeTo(output)
```

The returned promise resolves only after the destination finishes. It rejects on an unhandled record error, source or destination failure, structural format error, or cancellation.

## Minimal error handling

```javascript
try {
  await exstream(input).csv({ header: true }).map(transform).pipeTo(output)
} catch (error) {
  const { origin, stage } = exstream.errorInfo(error)
  console.error(`Pipeline failed in ${origin}:${stage ?? 'unknown'}`, error)
}
```

Record errors can remain recoverable; graph failures are fatal. Choose the policy explicitly with `errors()`, `skipErrors()`, `routeErrors()`, or `failOnError()`.

## What to read next

Read [backpressure](/docs/concepts/backpressure/) before adding fan-out or connecting to event sources. If this already feels heavier than the problem, check [when not to use Exstream](/docs/project/when-not-to-use/).
