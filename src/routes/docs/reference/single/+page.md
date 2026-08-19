<svelte:head>
  <title>single() — Exstream</title>
  <meta name="description" content="Consume an Exstream that must produce at most one value." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/single/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `single()`

<p class="lead">Resolve with zero or one value, and reject when the stream produces more.</p>

## Example

```javascript
const user = await exstream(users)
  .find((user) => user.id === id)
  .single()
```

## Cardinality

An empty stream resolves with `undefined`; one value resolves with that value. A second value aborts the consumer branch and rejects with error code `EXSTREAM_MORE_THAN_ONE_VALUE`.

`single()` always returns a promise and consumes through normal end to prove that no second value exists. Use `head().single()` when you want the first value without enforcing cardinality on the original output.

Unhandled record errors, fatal failures, and aborts reject the promise.

## Signature

```typescript
single(): Promise<T | undefined>
```

## Related

[`head()`](/docs/reference/head/), [`last()`](/docs/reference/last/), [`toArray()`](/docs/reference/to-array/)
