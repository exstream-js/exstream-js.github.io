<svelte:head>
  <title>batch() — Exstream</title>
  <meta name="description" content="Group Exstream values into bounded arrays, including size validation, partial batches, contexts, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/batch/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `batch()`

<p class="lead">Group successful values into arrays with a fixed maximum length.</p>

## Signature

```typescript
batch(size: number): Exstream<T[], AggregateOutputContext<C, T[]>>
```

## Example

```javascript
await exstream(records)
  .batch(100)
  .mapAsync((items) => database.insertMany(items), { concurrency: 4 })
  .drain()
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>size</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer</code></span><span><strong>Required</strong></span></p>
      <p>The maximum number of successful values in one batch. Zero, negative values, fractions, <code>NaN</code>, and <code>Infinity</code> are rejected when the operator is created. The JavaScript runtime applies <code>Number()</code>, so any value coercing to a positive integer is accepted; TypeScript intentionally accepts only numbers. Use an actual number rather than relying on coercion.</p>
    </dd>
  </div>
</dl>

## Behavior

A full array is emitted as soon as it reaches `size`. When the source ends, a final non-empty partial array is emitted. An empty source emits no batches:

```javascript
await exstream([1, 2, 3, 4, 5]).batch(2).toArray()
// [[1, 2], [3, 4], [5]]
```

The operator preserves order and buffers at most `size` successful values. It does not impose concurrency; downstream async work controls that separately.

## Context

Each output has an aggregate record context. Its `contexts` array contains the input contexts in batch order when contexts were materialized upstream, while its input is the emitted batch itself.

## Errors

Existing record errors pass through immediately and are not included in a batch. If an error policy handles them, batching continues with later successful values. Fatal failures abort the branch and discard the incomplete batch.

## Forms

`batch()` is available on streams and reusable pipelines. The standalone form accepts the stream directly or returns a curried operator:

```javascript
stream.batch(100)
exstream.pipeline().batch(100)
exstream.batch(100, stream)
stream.through(exstream.batch(100))
```

## Related

[`collect()`](/docs/reference/collect/), [`mapAsync()`](/docs/reference/map-async/), [`csvStringify()`](/docs/reference/csv-stringify/)
