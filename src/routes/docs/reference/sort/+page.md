<svelte:head>
  <title>sort() — Exstream</title>
  <meta name="description" content="Sort a complete Exstream lexically, including conversion rules, undefined, symbols, memory, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sort/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `sort()`

<p class="lead">Buffer the complete stream and emit its values in ascending string order.</p>

## Example

```javascript
await exstream([10, 2, 1]).sort().toArray()
// [1, 10, 2]
```

## Ordering

Values are compared using `String(value)` and ascending code-unit order, not numeric order. `undefined` is always placed after defined values. Sorting is stable when values compare equally. Symbols cannot be converted by this operator and cause a record error for the collected input. Use [`sortBy()`](/docs/reference/sort-by/) for numeric, locale-aware, or field ordering.

## Buffering

`sort()` retains every successful value and its context until upstream ends. Sorting requires seeing the complete input before the first position is known, so memory grows with the entire stream and no output appears early. It cannot operate on an infinite source.

For large inputs, prefer a source that can provide the required order, such as a database query, or use an external sort designed to spill to disk. During final emission, normal downstream pressure still applies. Existing record errors pass through immediately and are not sorted.

## Forms

```javascript
stream.sort()
exstream.pipeline().sort()
```

## Signature

```typescript
sort(): Exstream<T, C>
```

## Related

[`sortBy()`](/docs/reference/sort-by/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`collect()`](/docs/reference/collect/)
