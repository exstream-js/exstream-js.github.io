<script>
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
</script>

<svelte:head>
  <title>Async processing — Exstream</title>
  <meta name="description" content="Process records with bounded asynchronous concurrency, ordering, retries, errors, backpressure, throttling, and rate limits." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/async-work/" />
</svelte:head>

<p class="eyebrow">Learn</p>

# Async processing

Many pipelines need to perform I/O for each record. An order may need its customer profile and current risk score; an address may need validation; a product may need inventory from another service; a document may need to be written to a search index.

Awaiting each operation before reading the next record is simple but often leaves most of the available I/O capacity unused. Starting one promise for every input has the opposite problem: it can overwhelm the remote service and retain an unbounded number of records.

## The decisions involved

- **Concurrency and order.** The pipeline needs a limit on work in flight and a decision about whether later results may overtake slower earlier ones.
- **Retries and timeouts.** Temporary failures may be retried, but permanent failures should not be. Every attempt also needs a time limit.
- **Errors.** When all attempts fail, the record may stop the pipeline, be replaced, be dropped, or go to a dead-letter destination.
- **Backpressure.** A slow destination must also limit new work. Otherwise completed results simply accumulate after the asynchronous operation.

## Process records with `mapAsync()`

`mapAsync()` runs a promise-returning function for each record and makes those policies part of the operator:

```javascript
const enrichedOrders = exstream(orders).mapAsync(
  async (order, context) => {
    const response = await fetch(`/customers/${order.customerId}`, {
      signal: context.signal,
    })

    if (!response.ok) {
      throw Object.assign(new Error(`Customer API returned ${response.status}`), {
        status: response.status,
      })
    }

    return {
      ...order,
      customer: await response.json(),
    }
  },
  {
    concurrency: 8,
    ordered: true,
    timeout: 5_000,
    retry: {
      retries: 3,
      delay: (attempt) => 250 * 2 ** (attempt - 1),
      when: (error) => error.status === 429 || error.status >= 500,
    },
  },
)
```

<PlaygroundLink example="async-work" />

This operator owns at most eight records: callbacks still running, retry delays, and completed results waiting for downstream. When the window is full it stops asking upstream for more input. A slow destination therefore reduces new work instead of creating a separate result queue.

`ordered: true` emits enriched orders in source order. If every record is independent and lower latency matters more than order, allow each result to leave when it finishes:

```javascript
const indexedDocuments = documents.mapAsync(indexDocument, {
  concurrency: 16,
  ordered: false,
})
```

Retries happen inside the same concurrency slot. In the enrichment example, only rate limits and server failures are retried; other HTTP failures become record errors immediately. The timeout applies to each attempt, and forwarding `context.signal` lets `fetch` stop when an attempt times out or the branch is cancelled.

Read the [`mapAsync()` reference](/docs/reference/map-async/) for the complete option and timing contracts.

## Handle failed records

An exhausted retry or timeout enters Exstream as a record error associated with the original input. For example, successful enrichments and dead letters can be sent to separate destinations:

```javascript
const { output, deadLetters } = enrichedOrders.routeErrors()

await Promise.all([output.pipeTo(warehouseWriter), deadLetters.pipeTo(deadLetterWriter)])
```

Fatal source, destination, and lifecycle failures still abort the flow; they are not retryable record failures. Continue with [Errors and lifecycle](/docs/learn/errors/) for replacement, skipping, dead-letter routing, and fatal failure behavior.

## Throttle and rate limit

`throttle()` and `ratelimit()` also control processing over time, but they have different delivery rules.

Use `throttle()` when intermediate updates may be discarded. This emits at most one progress snapshot per second and drops snapshots that arrive inside the window:

```javascript
const visibleProgress = progressEvents.throttle(1_000)
```

Use `ratelimit()` when every record must be kept but may need to wait. This starts no more than 100 API calls per minute, while `mapAsync()` separately limits simultaneous requests:

```javascript
const responses = requests
  .ratelimit(100, 60_000)
  .mapAsync(sendRequest, { concurrency: 8, ordered: false })
```

`ratelimit()` turns the delay into upstream backpressure instead of accumulating all waiting requests. Read the [`throttle()`](/docs/reference/throttle/) and [`ratelimit()`](/docs/reference/ratelimit/) references for their exact window behavior.
