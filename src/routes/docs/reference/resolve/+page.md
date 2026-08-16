<svelte:head>
  <title>resolve() — Exstream</title>
  <meta name="description" content="Resolve promise values in Exstream with complete parallelism, ordering, cancellation, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/resolve/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `resolve()`

<p class="lead">Await promise values already present in the stream, with bounded parallelism and optional completion-order output.</p>

## Signature

```typescript
resolve(
  parallelism?: number,
  preserveOrder?: boolean,
): Exstream<ResolvedValue<T>, C>
```

## Example

```javascript
const responses = exstream(urls)
  .map((url) => fetch(url))
  .resolve(8, false)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>parallelism</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>1</code></span></p>
      <p>Maximum number of promises observed at once. Positive integers and <code>Infinity</code> are accepted; zero, negatives, fractions, and non-numeric values are rejected. The JavaScript runtime applies <code>Number()</code>, so any value coercing to an allowed number is accepted; TypeScript accepts numbers only.</p>
    </dd>
  </div>
  <div>
    <dt><code>preserveOrder</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p>
      <p>When true, output follows input order. When false, fulfilled values are emitted in completion order. Ordered mode may retain later completed values behind an earlier pending promise. The runtime uses truthiness; the public TypeScript API accepts booleans only.</p>
    </dd>
  </div>
</dl>

## Behavior

Every successful input must be a native `Promise` recognized by the active JavaScript realm. Although the TypeScript utility type is expressed in terms of `PromiseLike`, the current runtime check uses `instanceof Promise`; a plain thenable is therefore rejected as a non-promise. That rejection becomes a record error rather than passing through. At most `parallelism` promises are active, and downstream backpressure limits further upstream demand.

`resolve()` is useful when promises were created elsewhere or when a previous synchronous operator intentionally emits promises. Prefer [`mapAsync()`](/docs/reference/map-async/) when Exstream should own callback execution, retry, timeout, or cancellation policy.

`parallelism` limits how many promise records Exstream observes concurrently. It cannot stop promises that were created eagerly before entering the stream from already running. To bound operation creation, create promises lazily in an upstream `map()` under `resolve()` demand, or use `mapAsync()`.

## Errors

A rejected promise becomes a contextual record error associated with the original promise input. Handle it downstream to continue processing. A fatal rejection or graph failure aborts the operator.

Fulfilled values and rejected errors retain the input promise's record context. Ordered mode keeps that association while buffering out-of-order settlements.

## Cancellation

Destroying or aborting the branch stops scheduling new promises and discards later results. It cannot cancel a bare promise by itself; cancellation must be wired into the operation that created that promise.

## Forms

`resolve()` is available on streams and reusable pipelines. Its direct standalone form takes both configuration arguments before the stream; its curried form may omit them:

```javascript
stream.resolve(8, false)
exstream.pipeline().resolve(8, false)
exstream.resolve(8, false, stream)
stream.through(exstream.resolve(8, false))
```

## Related

[`mapAsync()`](/docs/reference/map-async/), [`map()`](/docs/reference/map/), [`merge()`](/docs/reference/merge/)
