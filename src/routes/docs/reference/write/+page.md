<svelte:head><title>write() — Exstream</title><meta name="description" content="Write data, errors, or end markers into a writable Exstream with complete pressure, buffering, and lifecycle behavior." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/write/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `write()`

<p class="lead">Push one data value, record error, or end marker into a manually writable Exstream.</p>

## Example

```javascript
const source = exstream()
const completion = source.map(transform).toArray()

if (!source.write(row)) await new Promise((resolve) => source.once('drain', resolve))
source.end()
const result = await completion
```

## Value protocol

Ordinary values are data. An `Error` becomes a recoverable record error. `exstream.nil` ends the stream. `exstream.data(error)` forces an Error object to travel as data.

The boolean reports whether writing may continue without waiting. `false` means the stream is paused or the configured best-effort overflow policy rejected the new value. A producer should wait for `drain` before continuing. With `overflow: 'error'`, exceeding `bufferLimit` throws `BufferOverflowError`; drop policies update `dropped`.

## Lifecycle

Writes may buffer while paused. Calling `write()` after end/nil throws `Cannot write to stream after nil`. `write()` does not automatically end a source.

## Forms

`write()` is instance-only and intended for manually writable sources and adapters.

## Signature

```typescript
write(value: T | Error | DataValue<T> | typeof exstream.nil): boolean
```

## Related

[`data()`](/docs/reference/data/), [`end()`](/docs/reference/end/), [Create a source](/docs/learn/sources/)
