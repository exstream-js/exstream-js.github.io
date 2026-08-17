<svelte:head>
  <title>uniq() — Exstream</title>
  <meta name="description" content="Keep the first occurrence of each Exstream value, with equality, memory, ordering, context, and error behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/uniq/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `uniq()`

<p class="lead">Keep the first occurrence of every distinct value.</p>

## Signature

```typescript
uniq(): Exstream<T, C>
```

## Example

```javascript
await exstream(['eu', 'us', 'eu', 'apac', 'us']).uniq().toArray()
// ['eu', 'us', 'apac']
```

## Equality

Seen values are stored in a JavaScript `Set`, so equality follows SameValueZero: `NaN` equals `NaN`, `0` equals `-0`, primitives compare by value, and objects compare by identity. Structurally equal object literals are distinct unless they are the same object reference. Use [`uniqBy()`](/docs/reference/uniq-by/) for a derived key.

## Memory and pressure

`uniq()` is synchronous, stable, context-preserving, and adds no output queue. Its internal `Set` grows with the number of distinct values and is released when the branch ends; it is therefore unsuitable for an unbounded stream with unbounded key cardinality. Existing record errors pass through and are not stored.

## Forms

```javascript
stream.uniq()
exstream.pipeline().uniq()
exstream.uniq(stream)
```

## Related

[`uniqBy()`](/docs/reference/uniq-by/), [`compact()`](/docs/reference/compact/), [`groupBy()`](/docs/reference/group-by/)
