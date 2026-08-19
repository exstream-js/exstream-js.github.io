<svelte:head>
  <title>collect() — Exstream</title>
  <meta name="description" content="Collect all successful Exstream values into one array, including empty input, memory, contexts, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/collect/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `collect()`

<p class="lead">Buffer all successful values and emit one array when the source ends.</p>

## Example

```javascript
const [records] = await exstream(source).collect().toArray()
```

## Behavior

`collect()` preserves input order and emits exactly one successful value at normal source completion. An empty source emits an empty array:

```javascript
await exstream([]).collect().toArray()
// [[]]
```

It is an intermediate operator, not a terminal consumer. The returned stream still needs demand from `toArray()`, `drain()`, `pipeTo()`, or another consumer.

## Memory

The complete successful input remains in memory until the source ends, so memory use grows linearly with input size and has no built-in limit. Prefer [`batch()`](/docs/reference/batch/) when work can be processed incrementally, and reserve `collect()` for datasets whose maximum size is known and acceptable.

## Context

The emitted array has an aggregate context. Its `contexts` property preserves materialized input contexts in input order, and its input is the collected array.

## Errors

Record errors pass through immediately and are excluded from the array. If handled downstream, collection continues and the array is still emitted at normal completion. An unhandled or fatal failure prevents normal completion and therefore prevents the final array from being emitted.

## Forms

`collect()` is available on streams, reusable pipelines, and as a standalone operator. It takes no configuration, so the standalone form receives the stream directly:

```javascript
stream.collect()
exstream.pipeline().collect()
exstream.collect(stream)
```

## Signature

```typescript
collect(): Exstream<T[], AggregateOutputContext<C, T[]>>
```

## Related

[`batch()`](/docs/reference/batch/), [`drain()`](/docs/reference/drain/), [async iteration](/docs/reference/async-iteration/)
