<svelte:head><title>writeData() — Exstream</title><meta name="description" content="Write any JavaScript value, including Error objects, as Exstream data with pressure and lifecycle behavior." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/write-data/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `writeData()`

<p class="lead">Write a value unconditionally as data, even when it is an `Error` or Exstream control-like value.</p>

## Signature

```typescript
writeData(value: T): boolean
```

## Example

```javascript
const source = exstream()
source.writeData(new Error('this is payload'))
source.end()
```

## Behavior

Unlike `write()`, this method bypasses Error classification. The value enters the ordinary data path and callbacks receive it as data. It has the same boolean backpressure contract, buffering limits, overflow policies, and post-end rejection as `write()`.

Prefer `writeData(error)` or `write(exstream.data(error))` when Error objects are part of the domain model. Do not use it to disguise operational failures that should enter Exstream's error protocol.

## Forms

`writeData()` is instance-only.

## Related

[`write()`](/docs/reference/write/), [`errors()`](/docs/reference/errors/), [`end()`](/docs/reference/end/)
