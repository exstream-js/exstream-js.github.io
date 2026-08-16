<svelte:head>
  <title>Async work — Exstream</title>
  <meta name="description" content="Control concurrent asynchronous transformations, output order, retries, timeouts, and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/async-work/" />
</svelte:head>

<p class="eyebrow">Learn · Concurrency</p>

# Async work and order

<p class="lead">Asynchronous ETL needs an explicit answer to two questions: how much work may run, and in which order may results leave?</p>

## Set the bound

```javascript
const enriched = exstream(orderIds).mapAsync(
  async (id, context) => {
    const response = await fetch(`/customers/${id}`, {
      signal: context.signal,
    })
    return response.json()
  },
  { concurrency: 8 },
)
```

`concurrency: 8` allows at most eight active callbacks. The default is one. The bound limits parallel I/O; downstream backpressure may reduce the active work further.

## Choose the order

`ordered: true` is the default. A fast later result waits until every earlier result is ready. This makes output predictable but can create head-of-line blocking.

```javascript
const fastestFirst = orders.mapAsync(enrichOrder, {
  concurrency: 16,
  ordered: false,
})
```

Use unordered output only when the destination does not depend on source order. The concurrency bound still applies.

## Bound failure policy

```javascript
const enriched = orders.mapAsync(enrichOrder, {
  concurrency: 8,
  ordered: true,
  retry: 2,
  timeout: 5_000,
})
```

`retry: 2` means two additional attempts after the first failure. `timeout` applies to each attempt. The record context contains a signal that is cancelled when the branch no longer needs the work.

## Retained work

Concurrency is not the only retention bound. Ordered output may hold completed later results behind one slow earlier result. The downstream destination may also stop accepting output temporarily.

Document all three choices together: concurrency, order, and downstream buffering. Continue with [backpressure](/docs/concepts/backpressure/) to see how they interact across the graph.
