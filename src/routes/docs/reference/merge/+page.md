<svelte:head>
  <title>merge() — Exstream</title>
  <meta name="description" content="Merge a stream of Exstreams with complete parallelism, ordering, buffering, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/merge/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `merge()`

<p class="lead">Lazily consume Exstreams or stream factories carried by the outer stream, with bounded activation and optional outer-source order.</p>

## Example

```javascript
const responses = exstream(urls)
  .map((url) => () => exstream(fetch(url)))
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

Every successful outer value must be a readable Exstream instance or a zero-argument factory that synchronously returns one. A factory is invoked once, only when an activation slot is available. This lets `parallelism` control resource creation as well as consumption:

```javascript
exstream(paths)
  .map((path) => () => exstream(fs.createReadStream(path)))
  .merge(4)
```

Fork a direct inner stream first if it is already part of another reliable chain. A factory that throws or returns anything other than an Exstream becomes a record error; promises of Exstreams are intentionally not accepted. Existing outer record errors pass through. To expand synchronous iterables, use [`flatMap()`](/docs/reference/flat-map/) instead.

## Order and pressure

Unordered mode forwards frames as active inner streams produce them. A delivered frame releases only the inner that produced it, so downstream pressure keeps every active inner to at most one ready frame.

Ordered mode streams the current inner directly. Later active inners are still consumed eagerly, but their data, record errors, and contexts are buffered as protocol frames. When the current inner ends, the next inner's buffered frames are replayed in order; if that inner is still open, its subsequent frames continue streaming directly.

This eager ordered buffering is useful for response bodies, cursors, and similar resources that must be consumed before their turn to emit. It can retain a complete future inner stream and must not be used with unbounded or unexpectedly large inners. A finite `parallelism` bounds active and completed-but-not-emitted inner streams, not the number of records held by each ordered slot.

`merge()` is lazy: no inner stream is activated until downstream consumption starts.

The activation limit cannot retroactively pause work owned by direct inner streams that started before `merge()` attached. Use stream factories when activation must control resource creation; configure source buffers as well when the resource can produce data independently after activation.

## Errors

Record errors from the outer or any inner stream are forwarded in the selected order with their contexts and do not complete an inner slot. Factory failures are outer record errors and release their slot after delivery. Fatal failure or abort of an active inner aborts the merged branch and stops the coordinator. Cancelling the merged output destroys all active inner work and prevents pending factories from being invoked.

## Forms

`merge()` is available only as an instance method on the outer stream of Exstreams or stream factories. It is not a reusable-pipeline or standalone operator because it coordinates live inner stream instances.

## Signature

```typescript
merge(
  parallelism?: number,
  preserveOrder?: boolean,
): Exstream<InnerValue, InnerContext>
```

## Related

[`fork()`](/docs/reference/fork/), [`flatMap()`](/docs/reference/flat-map/), [`mapAsync()`](/docs/reference/map-async/)
