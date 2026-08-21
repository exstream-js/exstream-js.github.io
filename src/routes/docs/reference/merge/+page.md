<svelte:head>
  <title>merge() — Exstream</title>
  <meta name="description" content="Merge a stream of Exstreams with concurrency, ordering, buffering, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/merge/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `merge()`

<p class="lead">Consume the Exstreams carried by an outer stream with bounded activation and optional outer-source order.</p>

## Example

```javascript
const responses = exstream(urls)
  .map((url) => exstream.defer(async () => (await fetch(url)).body).jsonl())
  .merge({ concurrency: 4, ordered: false })
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>concurrency</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p>
      <p>Maximum active inner Exstreams. Use a finite value when each stream owns a request, file, cursor, or other bounded resource. Zero, negatives, fractions, and invalid numbers are rejected.</p>
    </dd>
  </div>
  <div>
    <dt><code>ordered</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>When false, values from active streams interleave as available. When true, all output from one inner stream is emitted before later outer-stream entries, preserving both outer and inner order.</p>
    </dd>
  </div>
</dl>

`concurrency` is normalized with `Number()` at runtime, so any value coercing to a positive integer or `Infinity` is accepted. `ordered` must be a boolean.

## Input

Every successful outer value must be a readable Exstream instance. Use `defer()` when `concurrency` should control resource creation as well as consumption:

```javascript
import { createReadStream } from 'node:fs'

exstream(paths)
  .map((path) => exstream.defer(() => createReadStream(path)))
  .merge({ concurrency: 4 })
```

`merge()` activates at most four inner streams, so at most four deferred factories acquire their sources at once. A `defer()` factory may return any supported source and may be asynchronous.

Fork an inner stream first if it is already part of another reliable chain. A value that is not an Exstream becomes a record error. Existing outer record errors pass through. To expand synchronous iterables, use [`flatMap()`](/docs/reference/flat-map/) instead.

## Order and pressure

Unordered mode forwards frames as active inner streams produce them. A delivered frame releases only the inner that produced it, so downstream pressure keeps every active inner to at most one ready frame.

Ordered mode streams the current inner directly. Later active inners are still consumed eagerly, but their data, record errors, and contexts are buffered as protocol frames. When the current inner ends, the next inner's buffered frames are replayed in order; if that inner is still open, its subsequent frames continue streaming directly.

This eager ordered buffering is useful for response bodies, cursors, and similar resources that must be consumed before their turn to emit. It can retain a complete future inner stream and must not be used with unbounded or unexpectedly large inners. A finite `concurrency` bounds active and completed-but-not-emitted inner streams, not the number of records held by each ordered slot.

`merge()` is lazy: no inner stream is activated until downstream consumption starts.

The activation limit cannot retroactively pause work owned by inner sources opened before `merge()` attached. Use `defer()` when activation must control resource creation; configure source buffers as well when the resource can produce data independently after activation.

## Errors

Record errors from the outer or any inner stream are forwarded in the selected order with their contexts and do not complete an inner slot. A deferred acquisition failure is a source record error; once delivered, the failed inner ends and releases its slot. Fatal failure or abort of an active inner aborts the merged branch and stops the coordinator. Cancelling the merged output destroys all active inner work and leaves deferred sources outside the activation window unopened.

## Forms

`merge()` is available only as an instance method on the outer stream of Exstreams. It is not a reusable-pipeline operator because it coordinates live inner stream instances.

## Signature

```typescript
merge(
  options?: {
    concurrency?: number
    ordered?: boolean
  },
): Exstream<InnerValue, InnerContext>
```

## Related

[`fork()`](/docs/reference/fork/), [`flatMap()`](/docs/reference/flat-map/), [`mapAsync()`](/docs/reference/map-async/)
