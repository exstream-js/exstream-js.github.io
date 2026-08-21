<svelte:head>
  <title>toArray() — Exstream</title>
  <meta name="description" content="Run an Exstream and collect every value into a Promise of an array." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-array/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toArray()`

<p class="lead">Run the stream to completion and resolve with every output value.</p>

## Example

```javascript
const rows = await exstream(response.body).csv({ header: true }).toArray()
```

## Behavior

`toArray()` is terminal and starts demand immediately. It always returns a promise, including for a completely synchronous pipeline. Normal completion resolves with values in output order, or `[]` for an empty stream.

The promise rejects on the first unhandled record error, fatal failure, or abort.

## Buffering

`toArray()` retains every output value until the stream ends because the resolved result is one complete array. Memory grows linearly with output size, and an unbounded stream can neither resolve nor release that accumulated output.

Use [`drain()`](/docs/reference/drain/) when values can be discarded, [`pipeTo()`](/docs/reference/pipe-to/) when they have a destination, or [async iteration](/docs/reference/async-iteration/) to process them incrementally.

## Signature

```typescript
toArray(): Promise<T[]>
```

## Related

[`single()`](/docs/reference/single/), [`drain()`](/docs/reference/drain/), [async iteration](/docs/reference/async-iteration/), [`collect()`](/docs/reference/collect/)
