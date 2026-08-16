<svelte:head><title>pull() — Exstream</title><meta name="description" content="Read one Exstream record on demand with a Promise or callback, including errors, end markers, context, and consumer ownership." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/pull/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `pull()`

<p class="lead">Attach a one-record consumer and request the next data, error, or end record.</p>

## Signature

```typescript
pull(): Promise<T | typeof exstream.nil>
pull(fn: (error: ExstreamError<T> | null | undefined, value: T | typeof exstream.nil, context?: C) => void): void
```

## Example

```javascript
const value = await stream.pull()
if (value !== exstream.nil) console.log(value)
```

## Behavior

Each call creates a temporary synchronous consumer, resumes it, removes it after one protocol record, and leaves the stream available for a later pull. Promise form resolves with data or `exstream.nil` and rejects on a record error. Callback form receives `(error, value)` and receives context only when it declares a third parameter.

An Exstream output supports one reliable consumer at a time. Do not mix pending pulls with another operator or terminal on the same branch; fork when consumers must coexist. Repeated pulls provide manual demand and therefore backpressure upstream.

## Related

[`toAsyncIterator()`](/docs/reference/to-async-iterator/), [`consume()`](/docs/reference/consume/), [`each()`](/docs/reference/each/)
