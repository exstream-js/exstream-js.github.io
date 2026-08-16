<svelte:head>
  <title>sortBy() — Exstream</title>
  <meta name="description" content="Sort a complete Exstream with a comparator, including comparator contract, context, memory, stability, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sort-by/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `sortBy()`

<p class="lead">Buffer the complete stream and order it with a synchronous comparison function.</p>

## Signature

```typescript
sortBy(
  fn: (left: T, right: T, leftContext: C, rightContext: C) => number,
): Exstream<T, C>
```

## Example

```javascript
const ranked = exstream(products).sortBy((left, right) => right.score - left.score)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(left, right, leftContext, rightContext) =&gt; number</code></span><span><strong>Required</strong></span></p><p>Return a negative number for left-first, a positive number for right-first, or zero to preserve their relative order. Context arguments are supplied only when the callback declares at least three parameters.</p></dd></div>
</dl>

## Behavior

All successful values and contexts are retained until upstream ends. Sorting is stable for equal comparisons and each emitted value keeps its original context. No output is available before completion, and infinite input never finishes. Existing record errors pass through immediately and are excluded from sorting.

The comparator is synchronous. Promise results are coerced by the platform sort algorithm and are not useful.

## Errors

A thrown comparator failure produces one record error whose input is the array of collected successful values; its aggregate context contains their contexts. No sorted values are emitted after that failure.

## Forms

```javascript
stream.sortBy(compare)
exstream.pipeline().sortBy(compare)
exstream.sortBy(compare, stream)
stream.through(exstream.sortBy(compare))
```

## Related

[`sort()`](/docs/reference/sort/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`sortedJoin()`](/docs/reference/sorted-join/)
