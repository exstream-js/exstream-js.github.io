<svelte:head>
  <title>sortedJoin() — Exstream</title>
  <meta name="description" content="Join two sorted Exstreams with inner, left, or right semantics, including keys, ordering, duplicate rows, buffering, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sorted-join/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `sortedJoin()`

<p class="lead">Merge-join exactly two pre-sorted streams without collecting both inputs.</p>

## Example

```javascript
const joined = exstream([customersById, ordersByCustomerId]).sortedJoin(
  'id',
  'customerId',
  'left',
  'asc',
)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>leftKey</code>, <code>rightKey</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>function | string field</code></span><span><strong>Required</strong></span></p><p>Key selectors for the two input streams. String fields support nested paths. Although the declaration accepts any property key, the runtime field shorthand recognizes strings only; use callbacks for number or symbol fields.</p></dd></div>
  <div><dt><code>type</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'inner' | 'left' | 'right'</code></span><span><strong>Default</strong> <code>'inner'</code></span></p><p>Controls which unmatched side is emitted with the other field set to <code>null</code>.</p></dd></div>
  <div><dt><code>direction</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>'asc' | 'desc' | comparator</code></span><span><strong>Default</strong> <code>'asc'</code></span></p><p>Must match both inputs' ordering. A function receives <code>(leftKey, rightKey, leftContext, rightContext)</code> and returns truthy when the right key precedes the left key, so the right input should advance. It is not an Array.sort numeric comparator.</p></dd></div>
  <div><dt><code>buffer</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>positive integer</code></span><span><strong>Default</strong> <code>1</code></span></p><p>Optional batch size used internally before flattening. It changes read granularity, not join semantics.</p></dd></div>
</dl>

## Input and output

The outer stream must emit exactly two Exstream instances: `[left, right]`. Both must already be sorted in the declared direction. Output is `{ key, a, b }`. Repeated keys on the grouped/master side are multiplied against each matching value on the other side. Left and right joins emit unmatched rows with `null`; inner joins omit them.

The outer two-stream list is collected first, then inputs are pulled incrementally with backpressure. Memory is proportional to one adjacent duplicate group plus the configured buffer. Output context aggregates the contributing row contexts.

## Errors

Wrong outer cardinality rejects with `.sortedJoin() can merge only 2 exstream instances`. Invalid buffer throws at construction. Selector, ordering, and input record errors enter the result error protocol. Incorrect sort order is not detected and produces incorrect join results rather than a validation error.

## Forms

`sortedJoin()` is available on a stream and as a direct standalone function. The reusable pipeline API intentionally omits it because its input type is specifically a pair of streams:

```javascript
exstream([left, right]).sortedJoin('id', 'parentId', 'left', 'asc', 1)
exstream.sortedJoin('id', 'parentId', 'left', 'asc', 1, exstream([left, right]))
```

## Signature

```typescript
sortedJoin<K, A, B>(
  leftKey: ((value: A, context: object) => K) | keyof A,
  rightKey: ((value: B, context: object) => K) | keyof B,
  type?: 'inner' | 'left' | 'right',
  direction?: 'asc' | 'desc' | ((left: K, right: K, leftContext: object, rightContext: object) => boolean),
  buffer?: number,
): Exstream<{ key: K; a: A | null; b: B | null }, AggregateContext<unknown, object>>
```

## Related

[`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`merge()`](/docs/reference/merge/), [`sortBy()`](/docs/reference/sort-by/)
