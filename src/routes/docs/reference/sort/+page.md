<svelte:head>
  <title>sort() — Exstream</title>
  <meta name="description" content="Sort a complete Exstream lexically or with a comparator, including memory, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sort/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `sort()`

<p class="lead">Buffer the complete stream and order it lexically or with a synchronous comparison function.</p>

## Example

```javascript
await exstream([10, 2, 1]).sort().toArray()
// [1, 10, 2]

const ranked = exstream(products).sort((left, right) => right.score - left.score)
```

## Ordering

Without a comparator, values are compared using `String(value)` and ascending code-unit order, not numeric order. `undefined` is always placed after defined values. Symbols cannot be converted by this operator and cause a record error for the collected input.

A comparator receives `(left, right, leftContext, rightContext)`. Return a negative number for left-first, a positive number for right-first, or zero to preserve their relative order. Context arguments are supplied only when the callback declares at least three parameters. The comparator is synchronous; promise results are not awaited.

Sorting is stable for equal comparisons and every emitted value keeps its original context.

## Buffering

`sort()` retains every successful value and its context until upstream ends. Sorting requires seeing the complete input before the first position is known, so memory grows with the entire stream and no output appears early. It cannot operate on an infinite source.

For large inputs, prefer a source that can provide the required order, such as a database query, or use an external sort designed to spill to disk. During final emission, normal downstream pressure still applies. Existing record errors pass through immediately and are not sorted.

## Errors

A thrown comparator failure produces one record error whose input is the array of collected successful values; its aggregate context contains their contexts. No sorted values are emitted after that failure.

## Forms

```javascript
stream.sort()
stream.sort(compare)
exstream.pipeline().sort()
exstream.pipeline().sort(compare)
```

## Signature

```typescript
sort(
  compare?: (left: T, right: T, leftContext: C, rightContext: C) => number,
): Exstream<T, C>
```

## Related

[`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`sortedJoin()`](/docs/reference/sorted-join/), [`collect()`](/docs/reference/collect/)
