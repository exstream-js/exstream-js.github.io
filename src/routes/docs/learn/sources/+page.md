---
playground: sources
---

<svelte:head>
  <title>Create a source — Exstream</title>
  <meta name="description" content="Create eager and deferred Exstream sources from iterables, promises, platform streams, generators, and events." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/sources/" />
</svelte:head>

<p class="eyebrow">Learn · Sources</p>

# Create a source

<p class="lead">Pass Exstream the source you already have. The adapter determines when values are read, how cancellation propagates, and whether the pipeline can stay synchronous.</p>

## Pick a source

| You have                | Create it with                      | Pressure model                     |
| ----------------------- | ----------------------------------- | ---------------------------------- |
| Array or iterable       | `exstream(iterable)`                | Pulled one value at a time         |
| Async iterable          | `exstream(asyncIterable)`           | Awaits one `next()` at a time      |
| Promise                 | `exstream(promise)`                 | Emits one asynchronous value       |
| Web `ReadableStream`    | `exstream(readable)`                | Reads through its reader on demand |
| Node readable           | `exstream(readable)`                | Uses Node stream pressure          |
| Custom producer         | `exstream((write, next) => …)`      | Producer advances with `next()`    |
| Existing Exstream       | `exstream(stream)`                  | Returns the same stream            |
| Deferred source         | `exstream.defer(() => source)`      | Creates it on activation           |
| Event target or emitter | `exstream.fromEvent(target, event)` | Hot; buffer explicitly when needed |

All source forms work with the same operators. What changes is the boundary where Exstream asks for more work.

## Iterables

Arrays, sets, generators, and other synchronous iterables preserve the synchronous path:

```javascript
const orders = exstream([
  { id: 1, total: 12 },
  { id: 2, total: 28 },
])

const totals = await orders.map((order) => order.total).toArray()
```

Async iterables are pulled only when downstream has capacity:

```javascript
async function* pages() {
  let cursor

  do {
    const response = await fetch(`/api/orders?cursor=${cursor ?? ''}`)
    const page = await response.json()
    yield* page.orders
    cursor = page.nextCursor
  } while (cursor)
}

const orders = exstream(pages())
```

If the branch is cancelled early, Exstream calls the iterator's `return()` method when available.

Exstream does not acquire a synchronous or asynchronous iterator while the graph is only being built. Iterator acquisition and the first `next()` happen after downstream demand activates the source.

## Why deferred sources exist

Backpressure can postpone reading from an existing source, but it cannot undo work that happened while that source was created. In this expression, `fetch()` runs before Exstream sees its result:

```javascript
const orders = exstream(fetch('/orders.jsonl'))
```

The same distinction applies to opening a file, database cursor, browser reader, or any source whose construction acquires a resource. Use `defer()` when creation itself must belong to the pipeline lifecycle:

```javascript
const orders = exstream
  .defer(async () => {
    const response = await fetch('/orders.jsonl')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.body
  })
  .jsonl()
```

The factory may return any supported source or a promise for one. Exstream invokes it exactly once, only after the graph is activated and has downstream demand. Building operators, attaching forks, or cancelling before activation does not invoke it. Factory failures enter the error protocol with source provenance.

`defer()` creates one single-use Exstream execution; it does not cache or replay records. When the same recipe must run independently more than once, wrap it in an application factory:

```javascript
const loadOrders = () => exstream.defer(() => fetchOrders())

const morning = await loadOrders().toArray()
const afternoon = await loadOrders().toArray()
```

This is different from `fork()`: forks share one execution and one backpressure boundary.

### Deferred creation and manual activation

Deferred creation answers “when is the source acquired?”. Manual activation answers “when is the graph complete?”. They meet at the same activation boundary but remain separate choices.

Automatic activation is the default and covers linear pipelines and forks built synchronously. If reliable forks must be discovered in different turns, keep the root graph in its building phase explicitly:

```javascript
const source = exstream.defer(() => openOrders(), {
  start: 'manual',
})

const database = source.fork().pipeTo(databaseWriter)

await discoverAuditDestination()
const audit = source.fork().pipeTo(auditWriter)

await source.start()
await Promise.all([database, audit])
```

Until `start()`, no deferred factory is called and reliable forks may still be attached—even after transforms and across timers or awaited work. `start()` is idempotent: it freezes fork registration and authorizes the root source to run, but it supplies no downstream demand and does not wait for completion.

## Platform streams

Pass a browser response body directly:

```javascript
const response = await fetch('/orders.jsonl')

const orders = exstream(response.body).jsonl().map(normalizeOrder)
```

Exstream acquires a Web `ReadableStream` reader, reads on demand, and cancels the reader when the branch terminates early. In Node.js, a readable stream can be passed in the same position:

```javascript
import { createReadStream } from 'node:fs'

const rows = exstream(createReadStream('orders.csv')).csv({ header: true })
```

Use the default `exstream` import in either runtime; package exports select the appropriate implementation.

## Promises

A promise is a one-value asynchronous source:

```javascript
const settings = exstream(loadSettings()).map(validateSettings)
```

The promise rejection enters the error protocol. The promise itself cannot be cancelled, but cancelling the Exstream branch prevents later output from being consumed.

Because promises are eager, use `defer(() => promise)` when creating the promise must wait for pipeline activation.

## Custom producers

Use a generator source when an API does not already expose an iterable or readable stream:

```javascript
const ticks = exstream((write, next) => {
  setTimeout(() => {
    write(Date.now())
    next()
  }, 1000)
})
```

`write(value)` emits a value. Call `next()` only when this production step is complete; Exstream invokes the producer again when downstream asks for another value. End the source with `write(exstream.nil)`.

`next(otherSource)` can hand production to another iterable, async iterable, readable stream, or generator without building a second pipeline.

## Events

An `EventTarget` or `EventEmitter` produces values whether downstream is ready or not, so it uses a separate adapter:

```javascript
const messages = exstream.fromEvent(socket, 'message', {
  map: (event) => event.data,
  end: 'close',
  error: 'error',
  highWaterMark: 128,
  overflow: 'drop-oldest',
})
```

By default, one event argument becomes the value and multiple arguments become an array. `map` can define a more useful record shape. Pausable emitters participate in backpressure; non-pausable hot sources use a finite `highWaterMark`—`1024` by default—and need an intentional overflow policy.

Normal completion or cancellation through the supplied signal removes the listeners. An `Error` received on the data event remains ordinary data; the configured `error` event is a fatal source failure.

## Buffer and cancellation

Directly constructed source boundaries accept the same buffer and cancellation options:

```javascript
const source = exstream(input, {
  bufferLimit: 64,
  overflow: 'error',
  signal,
  start: 'auto',
})
```

`bufferLimit` defaults to `Infinity`; `overflow` defaults to `'error'`. The drop policies require a finite limit. Prefer pull-based sources and small, deliberate buffers over using a large queue to hide a pressure mismatch.

`start` defaults to `'auto'`. Use `'manual'` only when graph construction crosses an asynchronous boundary, then call `start()` after every reliable fork has been attached.

An empty call, `exstream()`, creates a writable source. It is useful for adapters, but it makes production and shutdown your responsibility: respect the boolean returned by `write()`, call `end()`, and propagate cancellation.
