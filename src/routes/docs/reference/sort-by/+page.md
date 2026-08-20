<svelte:head>
  <title>sortBy() — Exstream</title>
  <meta name="description" content="Sort a complete Exstream with a comparator, including comparator contract, context, memory, stability, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sort-by/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `sortBy()`

<p class="lead">Buffer the complete stream and order it with a synchronous comparison function.</p>

## Example

```javascript
const ranked = exstream(products).sortBy((left, right) => right.score - left.score)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(left, right, leftContext, rightContext) =&gt; number</code></span><span><strong>Required</strong></span></p><p>Return a negative number for left-first, a positive number for right-first, or zero to preserve their relative order. Context arguments are supplied only when the callback declares at least three parameters.</p></dd></div>
</dl>

## Behavior

Sorting is stable for equal comparisons and each emitted value keeps its original context. Existing record errors pass through immediately and are excluded from sorting.

The comparator is synchronous. Promise results are coerced by the platform sort algorithm and are not useful.

## Buffering

`sortBy()` retains every successful value and its context until upstream ends. The comparator cannot determine the first output without the complete input, so memory grows with the entire stream and no output is available before completion. Infinite input never finishes.

For large inputs, prefer a source that can provide the required order or an external sort designed to spill to disk.

## Errors

A thrown comparator failure produces one record error whose input is the array of collected successful values; its aggregate context contains their contexts. No sorted values are emitted after that failure.

## Forms

```javascript
stream.sortBy(compare)
exstream.pipeline().sortBy(compare)
exstream.sortBy(compare, stream)
stream.through(exstream.sortBy(compare))
```

## Signature

```typescript
sortBy(
  fn: (left: T, right: T, leftContext: C, rightContext: C) => number,
): Exstream<T, C>
```

## Related

[`sort()`](/docs/reference/sort/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`sortedJoin()`](/docs/reference/sorted-join/)
