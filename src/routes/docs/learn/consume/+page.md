<script>
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
</script>

<svelte:head>
  <title>Consume a pipeline — Exstream</title>
  <meta name="description" content="Start a lazy Exstream pipeline and choose a terminal operation or streaming adapter." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/consume/" />
</svelte:head>

<p class="eyebrow">Learn · Terminal operations</p>

# Consume a pipeline

<p class="lead">A chain describes work; it does not run it. A terminal operation supplies demand and gives the caller one predictable completion or consumption boundary.</p>

## Chains are lazy

```javascript
const pipeline = exstream(source)
  .map(normalizeOrder)
  .filter((order) => order.active)

setTimeout(async () => {
  // The source has not been drained during this first second.
  // Calling the terminal method starts the drain here.
  const activeOrders = await pipeline.toArray()
  console.log(activeOrders)
}, 1_000)
```

Operators such as `map()`, `filter()`, `collect()`, and `reduce()` return another lazy Exstream. Work begins when you call `toArray()`, `single()`, `drain()`, or `pipeTo()`, or when a reader asks for data through async iteration or a platform adapter. See the [pipeline model](/docs/learn/pipeline-model/#when-work-starts) for the complete source → operators → consumer picture.

`start()` is different: it only releases a source whose automatic startup was disabled. Without a downstream consumer, there is still no demand.

<PlaygroundLink example="consume" />

## Pick the boundary

| You need                            | Use                                 | Result                                         |
| ----------------------------------- | ----------------------------------- | ---------------------------------------------- |
| Collect every value                 | `await stream.toArray()`            | `Promise<T[]>`                                 |
| Require zero or one value           | `await stream.single()`             | <code>Promise&lt;T &#124; undefined&gt;</code> |
| Run side effects and discard output | `await stream.drain()`              | `Promise<void>`                                |
| Send values to a destination        | `await stream.pipeTo(destination)`  | `Promise<void>`                                |
| Pull values one at a time           | `for await (const value of stream)` | Native async iteration                         |
| Expose a Node readable              | `stream.toNodeReadable()`           | Node `Readable`                                |
| Expose a Web readable               | `stream.toWebReadable()`            | Web `ReadableStream`                           |

## Finish and await

### `toArray()`

```javascript
const rows = await pipeline.toArray()
```

Collects the complete output in order. It is convenient for finite results known to fit in memory and rejects on an unhandled failure. [Reference →](/docs/reference/to-array/)

### `single()`

```javascript
const total = await exstream(orders)
  .reduce((sum, order) => sum + order.total, 0)
  .single()
```

Resolves with the only output value or `undefined` when empty. It rejects if a second value arrives; use `head().single()` when only the first matters. [Reference →](/docs/reference/single/)

### `drain()`

```javascript
await pipeline.mapAsync(publish).drain()
```

Consumes to completion without retaining output. Use it when the useful work happens in side-effecting operators. [Reference →](/docs/reference/drain/)

### `pipeTo()`

```javascript
await pipeline.pipeTo(destination)
```

Runs a reusable Exstream destination or writes to a Node writable or Web `WritableStream`. It propagates destination backpressure and settles after processing completes. [Reference →](/docs/reference/pipe-to/)

## Define a reusable destination

For an application writer, close a reusable pipeline with `drain()` and keep its internals outside the calling flow:

```javascript
const ordersApi = exstream
  .pipeline()
  .batch(200)
  .mapAsync(postOrders, { concurrency: 4, ordered: false })
  .drain()

await source.through(transform).pipeTo(ordersApi)
```

Here `drain()` does not start any work because it is called on a pipeline definition. It returns a reusable destination; the later `pipeTo()` call creates a fresh chain and starts it. Use [`destination()`](/docs/reference/destination/) when a run also needs to open and close a database client, transaction, or similar resource.

## Stream output

### Async iteration

```javascript
for await (const record of pipeline) {
  await writeRecord(record)
}
```

Exstream implements `Symbol.asyncIterator` directly. Each `next()` supplies demand for one record, awaited loop work naturally preserves backpressure, and breaking the loop cancels that consumer branch. [Reference →](/docs/reference/async-iteration/)

### Node and Web adapters

Use an adapter when another API expects a native readable rather than a writable destination.

In Node, `toNodeReadable()` lets an Exstream enter a standard Node stream pipeline:

```javascript
import { createWriteStream } from 'node:fs'
import { pipeline as nodePipeline } from 'node:stream/promises'
import { createGzip } from 'node:zlib'

await nodePipeline(
  exstream(rows).jsonlStringify().toNodeReadable(),
  createGzip(),
  createWriteStream('./rows.jsonl.gz'),
)
```

In a Web runtime, `toWebReadable()` can become a streaming response body:

```javascript
return new Response(exstream(rows).jsonlStringify().toWebReadable(), {
  headers: { 'content-type': 'application/x-ndjson' },
})
```

Both adapters pass demand and cancellation between Exstream and the native reader. See [`toNodeReadable()`](/docs/reference/to-node-readable/) and [`toWebReadable()`](/docs/reference/to-web-readable/).
