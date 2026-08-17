<svelte:head>
  <title>merge() — Exstream</title>
  <meta name="description" content="Merge a stream of Exstreams with complete parallelism, ordering, buffering, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/merge/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `merge()`

<p class="lead">Consume Exstreams carried by the outer stream, with bounded activation and optional outer-source order.</p>

## Signature

```typescript
merge(
  parallelism?: number,
  preserveOrder?: boolean,
): Exstream<InnerValue, InnerContext>
```

## Example

```javascript
const records = exstream(pageUrls)
  .map((url) => fetchPage(url))
  .merge(4, false)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>parallelism</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p>
      <p>Maximum active inner Exstreams. Use a finite value when each stream owns a request, file, cursor, or other bounded resource. Zero, negatives, fractions, and invalid numbers are rejected.</p>
    </dd>
  </div>
  <div>
    <dt><code>preserveOrder</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>When false, values from active streams interleave as available. When true, all output from one inner stream is emitted before later outer-stream entries, preserving both outer and inner order.</p>
    </dd>
  </div>
</dl>

`parallelism` is normalized with `Number()` at runtime, so any value coercing to a positive integer or `Infinity` is accepted. `preserveOrder` uses truthiness. TypeScript intentionally exposes a number and a boolean; use those explicit types.

## Input

Every successful outer value must be a readable Exstream instance that can accept a consumer. Fork an inner stream first if it is already part of another reliable chain. Any non-Exstream outer value becomes a record error stating that `merge()` can merge only Exstreams. Existing outer record errors pass through. To expand synchronous iterables, use [`flatMap()`](/docs/reference/flat-map/) instead.

## Order and pressure

Unordered mode forwards values as active inner streams produce them and propagates downstream pressure to those streams. Ordered mode collects each inner stream's records until it can emit that stream in outer order. It can therefore retain a complete inner stream and must not be used with an unbounded inner stream.

The result is asynchronous even when all inner sources are synchronous. A finite `parallelism` bounds active inner streams, not the number of values buffered by ordered mode.

The activation limit cannot retroactively pause work owned by hot inner streams that started before `merge()` attached. Create inner streams lazily or configure their source buffers when activation itself must control resource use.

## Errors

Record errors from inner streams are forwarded with their contexts. Fatal failure of an active inner stream aborts the merged branch and stops the coordinator. Cancelling the merged output destroys active inner work and prevents further activation.

## Forms

`merge()` is available only as an instance method on the outer stream of Exstreams. It is not a reusable-pipeline or standalone operator because it coordinates live inner stream instances.

## Related

[`fork()`](/docs/reference/fork/), [`flatMap()`](/docs/reference/flat-map/), [`mapAsync()`](/docs/reference/map-async/)
