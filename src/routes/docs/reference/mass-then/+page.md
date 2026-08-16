<svelte:head>
  <title>massThen() — Exstream</title>
  <meta name="description" content="Attach a success handler to every promise in an Exstream without awaiting it, including ordering, contexts, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/mass-then/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `massThen()`

<p class="lead">Call `.then()` on every promise value and emit the resulting promises.</p>

## Signature

```typescript
massThen<U>(
  fn: (value: ResolvedValue<T>, context: C) => U,
): Exstream<Promise<Awaited<U>>, C>
```

## Example

```javascript
const names = exstream(requestPromises)
  .massThen((response) => response.json())
  .resolve(8, true)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(resolvedValue, context) =&gt; U</code></span><span><strong>Required</strong></span></p><p>Passed to each input's <code>then()</code>. It may return a value or promise.</p></dd></div>
</dl>

## Behavior

`massThen()` does not await, limit, or reorder asynchronous work. It synchronously maps each input `x` to `x.then(fn)`, so output promise order equals input order while settlement order is unconstrained. Backpressure controls promise objects, not the work already represented by them.

Every input must expose a callable `.then()`. Context is captured and passed to `fn` only when it declares a second parameter.

## Errors

A missing or invalid `.then()` becomes a record error through `map()`. A rejected input bypasses `fn` and remains a rejected output promise. A throw or rejection from `fn` rejects that output promise; use `resolve()` or `mapAsync()` to turn it into Exstream's record-error protocol.

## Forms

```javascript
stream.massThen(onFulfilled)
exstream.pipeline().massThen(onFulfilled)
exstream.massThen(onFulfilled, stream)
stream.through(exstream.massThen(onFulfilled))
```

## Related

[`massCatch()`](/docs/reference/mass-catch/), [`resolve()`](/docs/reference/resolve/), [`mapAsync()`](/docs/reference/map-async/)
