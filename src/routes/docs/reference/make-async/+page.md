<svelte:head>
  <title>makeAsync() — Exstream</title>
  <meta name="description" content="Yield long synchronous Exstream pipelines to the event loop, including time budget, order, pressure, and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/make-async/" />
</svelte:head>

<p class="eyebrow">API · Flow</p>

# `makeAsync()`

<p class="lead">Periodically yield a long synchronous pipeline to the next event-loop turn.</p>

## Example

```javascript
let activeSearch

async function searchRows(pattern) {
  activeSearch?.abort()

  const controller = new AbortController()
  activeSearch = controller

  return exstream(tableRows, { signal: controller.signal })
    .makeAsync(8)
    .filter((row) => pattern.test(`${row.name} ${row.email}`))
    .toArray()
}
```

Each search gets up to roughly eight milliseconds of synchronous work before yielding. Starting a new search aborts the previous pipeline, and the browser gets opportunities to process input and render between execution slices.

Place `makeAsync()` before the expensive operator. If it followed `filter()`, rejected rows would never cross the scheduling boundary and a search with few matches could still monopolize the event loop.

## Parameters

<dl class="parameter-list">
  <div><dt><code>maxSyncExecutionTime</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number</code></span><span><strong>Required</strong></span></p><p>Approximate milliseconds of continuous synchronous delivery allowed before a record is deferred to the next turn. Zero yields before every record after the first.</p></dd></div>
</dl>

## Behavior

Values, record errors, order, and contexts are unchanged. Once elapsed monotonic time reaches the budget, the current record is scheduled for the next turn and upstream waits for its completion. The new execution slice starts before that record continues downstream, so its work counts toward the next budget. This makes the pipeline asynchronous and creates a cooperative scheduling boundary; it does not run work in a worker or parallel thread.

Only one deferred turn is pending, so the operator adds constant buffering and respects pressure. Existing record errors pass through. Ending or destroying the branch cancels a scheduled turn.

The budget can be exceeded by the time required to process one record: `makeAsync()` can yield only between records. Use a Worker when one callback is itself expensive enough to block the interface.

## Errors

Negative values, `NaN`, and `Infinity` are rejected when the operator is created. The JavaScript runtime coerces numeric strings, while TypeScript accepts numbers.

## Forms

```javascript
stream.makeAsync(8)
exstream.pipeline().makeAsync(8)
```

## Signature

```typescript
makeAsync(maxSyncExecutionTime: number): Exstream<T, C>
```

## Related

[`mapAsync()`](/docs/reference/map-async/), [`throttle()`](/docs/reference/throttle/), [`ratelimit()`](/docs/reference/ratelimit/)
