<svelte:head>
  <title>toPromise() — Exstream</title>
  <meta name="description" content="Collect an Exstream into a Promise, including completion, memory, error rejection, cancellation, and forms." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-promise/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toPromise()`

<p class="lead">Run the stream to completion and resolve with every successful output value.</p>

## Signature

```typescript
toPromise(): Promise<T[]>
```

## Example

```javascript
const rows = await exstream(response.body).csv({ header: true }).toPromise()
```

## Completion and memory

`toPromise()` is terminal and starts demand immediately. It resolves after normal end with an array in output order, including `[]` for empty input. Every value is retained, so use `drain()`, `pipeTo()`, or `toAsyncIterator()` for large or infinite streams.

The promise rejects on the first unhandled record error. The stream's error listener is removed after successful completion. Fatal failures and aborts also reject according to the pipeline lifecycle.

## Cancellation

The returned promise has no `.cancel()` method and accepts no signal. Pass a signal when constructing the source, use an abort-aware terminal such as `pipeTo()`/`toAsyncIterator()`, or call `stream.abort(reason)` on a retained stream reference.

## Forms

```javascript
await stream.toPromise()
await exstream.toPromise(stream)
```

## Related

[`drain()`](/docs/reference/drain/), [`toArray()`](/docs/reference/to-array/), [`toAsyncIterator()`](/docs/reference/to-async-iterator/), [`values()`](/docs/reference/values/)
