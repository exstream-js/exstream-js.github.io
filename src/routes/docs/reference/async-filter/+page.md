<svelte:head>
  <title>asyncFilter() — Exstream</title>
  <meta name="description" content="Filter Exstream values with an asynchronous predicate, including sequencing, order, pressure, context, cancellation, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/async-filter/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `asyncFilter()`

<p class="lead">Await one predicate at a time and keep values whose result is truthy.</p>

## Example

```javascript
const visible = exstream(documents).asyncFilter((document) => canRead(document.id))
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown | PromiseLike&lt;unknown&gt;</code></span><span><strong>Required</strong></span></p><p>Awaited for each successful value. Truthy keeps the original value; falsy drops it.</p></dd></div>
</dl>

## Execution

Concurrency is fixed at `1`. Input and output order are preserved, no speculative work is started, and `next()` is called only after the predicate settles, making the await a backpressure boundary. Use `mapAsync()` to compute booleans concurrently and a later `filter()` when higher throughput is required.

Retained values keep their context. A context is materialized only when the callback declares its second parameter.

## Errors and cancellation

A throw or rejection becomes a contextual record error with stage `asyncFilter`; the input is not emitted. Existing record errors pass through. Cancellation prevents new predicates, but running user work must observe `context.signal` to stop promptly. There are no built-in retry or timeout options.

## Forms

```javascript
stream.asyncFilter(predicate)
exstream.pipeline().asyncFilter(predicate)
exstream.asyncFilter(predicate, stream)
stream.through(exstream.asyncFilter(predicate))
```

## Signature

```typescript
asyncFilter(
  fn: (value: T, context: C) => unknown | PromiseLike<unknown>,
): Exstream<T, C>
```

## Related

[`filter()`](/docs/reference/filter/), [`mapAsync()`](/docs/reference/map-async/), [`reject()`](/docs/reference/reject/)
