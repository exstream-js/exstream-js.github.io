<svelte:head>
  <title>destination() — Exstream</title>
  <meta name="description" content="Define a reusable Exstream destination with high-level stream operators, resource setup, cleanup, errors, and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/destination/" />
</svelte:head>

<p class="eyebrow">API · Create</p>

# `destination()`

<p class="lead">Define a reusable terminal consumer without implementing a Node writable or Web WritableStream.</p>

## Resource lifecycle

Use `destination()` directly when every run needs setup and cleanup:

```typescript
const database = exstream.destination<Order>(async (source, { signal }) => {
  const client = await connect({ signal })
  try {
    await source
      .batch(200)
      .mapAsync((orders, { signal }) => client.insertMany(orders, { signal }), {
        concurrency: 4,
        ordered: false,
      })
      .drain()
  } finally {
    await client.close()
  }
})

await orders.pipeTo(database)
```

The callback receives an Exstream, not a low-level stream primitive. It must return a promise that represents complete consumption. Resolving without consuming the source rejects `pipeTo()` with `EXSTREAM_DESTINATION_INCOMPLETE`; returning a non-promise rejects with `EXSTREAM_DESTINATION_NO_PROMISE`.

The same destination can be used more than once, including concurrently. Each call receives a separate source branch and signal, so per-run clients and other mutable state belong inside the callback.

## Errors and cancellation

Unhandled source and operator errors reject `pipeTo()` with their original provenance. An error thrown by the destination callback is marked as a sink failure at stage `destination` and aborts that source branch. Put resource cleanup in `finally` around the awaited input chain.

An external `pipeTo(destination, { signal })` abort also cancels the source branch and the signal passed to the callback. Pass that signal to connection setup and other work that can still be pending before the input chain is attached.

Retries can repeat a request after the remote service has already applied it. Bulk POST destinations should use an idempotency key or another deduplication mechanism when retry is enabled.

## Signature

```typescript
destination<T>(
  run: (
    source: Exstream<T>,
    context: { signal: AbortSignal },
  ) => PromiseLike<void>,
): Destination<T>
```

Most destinations need only a reusable pipeline followed by `drain()`:

```typescript
const ordersApi = exstream
  .pipeline<Order>()
  .batch(200)
  .mapAsync(
    async (orders, { signal }) => {
      const response = await fetch('/api/orders/bulk', {
        method: 'POST',
        body: JSON.stringify(orders),
        headers: { 'content-type': 'application/json' },
        signal,
      })
      if (!response.ok) throw new Error(`POST failed: ${response.status}`)
    },
    { concurrency: 4, ordered: false, retry: 2 },
  )
  .drain()

await source.pipeTo(ordersApi)
```

`batch(200)` bounds each request, while `mapAsync()` controls how many requests may be active. Because no later value depends on request order, `ordered: false` lets completed batches release their slots immediately.

## Related

[`pipeline()`](/docs/reference/pipeline/), [`drain()`](/docs/reference/drain/), [`pipeTo()`](/docs/reference/pipe-to/), [`mapAsync()`](/docs/reference/map-async/)
