<svelte:head><title>data() and nil — Exstream</title><meta name="description" content="Use Exstream data wrappers and the nil end marker correctly, including Error payloads, source writes, and protocol boundaries." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/data/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# `data()` and `nil`

<p class="lead">Disambiguate domain data from Exstream's error and end control records.</p>

## Signature

```typescript
function data<T>(value: T): DataValue<T>
const nil: unique symbol
```

## Error values as data

`write(error)` interprets an `Error` as a record error. Wrap it to preserve it as domain data:

```javascript
source.write(exstream.data(new Error('stored failure')))
// equivalent at a writable boundary:
source.writeData(new Error('stored failure'))
```

The wrapper is consumed at the write boundary; downstream receives the original value, not `{ value }`. `data()` is useful inside iterables too, where each item passes through `write()` classification.

## End marker

`exstream.nil` is the unique protocol value meaning end. Custom generators finish with `write(exstream.nil)`, and low-level consumers receive/forward it. Do not use it as ordinary payload. High-level source adapters call `end()` for you.

## Related

[`write()`](/docs/reference/write/), [`writeData()`](/docs/reference/write-data/), [`consume()`](/docs/reference/consume/), [`end()`](/docs/reference/end/)
