<svelte:head>
  <title>makeAsync() — Exstream</title>
  <meta name="description" content="Yield long synchronous Exstream pipelines to the event loop, including time budget, order, pressure, and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/make-async/" />
</svelte:head>

<p class="eyebrow">API · Flow</p>

# `makeAsync()`

<p class="lead">Periodically yield a long synchronous pipeline to the next event-loop turn.</p>

## Signature

```typescript
makeAsync(maxSyncExecutionTime: number): Exstream<T, C>
```

## Example

```javascript
const responsive = exstream(largeArray).map(expensiveTransform).makeAsync(8)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>maxSyncExecutionTime</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number</code></span><span><strong>Required</strong></span></p><p>Approximate milliseconds of continuous synchronous delivery allowed before a value is deferred to the next turn. Zero yields after timing advances beyond the initial snapshot.</p></dd></div>
</dl>

## Behavior

Values, order, and contexts are unchanged. Once elapsed monotonic time exceeds the budget, the current value is scheduled for the next turn and upstream waits for its completion. This makes the pipeline asynchronous and creates a cooperative scheduling boundary; it does not run work in a worker or parallel thread.

Only one deferred turn is pending, so the operator adds constant buffering and respects pressure. Existing record errors pass through. Ending or destroying the branch cancels a scheduled turn.

## Errors

Negative values, `NaN`, and `Infinity` are rejected when the operator is created. The JavaScript runtime coerces numeric strings, while TypeScript accepts numbers.

## Forms

```javascript
stream.makeAsync(8)
exstream.pipeline().makeAsync(8)
exstream.makeAsync(8, stream)
stream.through(exstream.makeAsync(8))
```

## Related

[`mapAsync()`](/docs/reference/map-async/), [`throttle()`](/docs/reference/throttle/), [`ratelimit()`](/docs/reference/ratelimit/)
