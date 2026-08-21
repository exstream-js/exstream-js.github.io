<svelte:head>
  <title>sortedJoin() — Exstream</title>
  <meta name="description" content="Join two sorted Exstreams with inner, left, or right semantics without collecting either complete input." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sorted-join/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `sortedJoin()`

<p class="lead">Merge-join exactly two pre-sorted streams without collecting both inputs.</p>

## Example

```javascript
const joined = customersById.sortedJoin(ordersByCustomerId, {
  leftKey: 'id',
  rightKey: 'customerId',
  type: 'left',
})

await joined
  .map(({ left: customer, right: order }) => ({
    customer: customer.name,
    orderId: order?.id ?? null,
  }))
  .pipeTo(reportWriter)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>right</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>Exstream</code></span><span><strong>Required</strong></span></p><p>The sorted right input. The stream on which <code>sortedJoin()</code> is called is the left input.</p></dd></div>
  <div><dt><code>leftKey</code>, <code>rightKey</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>function | property key</code></span><span><strong>Required</strong></span></p><p>Selectors for the two join keys. A string may also address a nested field.</p></dd></div>
  <div><dt><code>type</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'inner' | 'left' | 'right'</code></span><span><strong>Default</strong> <code>'inner'</code></span></p><p>Controls which unmatched side is emitted with the other field set to <code>null</code>.</p></dd></div>
  <div><dt><code>order</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>'asc' | 'desc' | comparator</code></span><span><strong>Default</strong> <code>'asc'</code></span></p><p>Must match both inputs. A custom comparator follows the same numeric convention as <code>Array.sort()</code>: negative places the left key first, zero joins the keys, and positive places the right key first.</p></dd></div>
</dl>

## Input and output

Both inputs must already be sorted according to `order`; `sortedJoin()` does not sort them. Output is `{ key, left, right }`. Repeated keys produce every matching pair. A left join may set `right` to `null`, a right join may set `left` to `null`, and an inner join omits unmatched rows. TypeScript reflects those three result shapes.

The two inputs are pulled incrementally with backpressure. The left side is grouped for inner and left joins; the right side is grouped for right joins. Memory is therefore proportional to one adjacent duplicate group plus one record from the other side, not to the complete inputs. Matching pairs are emitted one at a time as downstream requests them. Output context aggregates the contributing row contexts.

## Errors

Invalid inputs and options throw when the join is constructed. Selector, comparator, and input record errors enter the result error protocol. Fatal failures and cancellation close the join and release both inputs. Incorrect input order is not detected and produces incorrect results.

## Forms

`sortedJoin()` is available only on a live Exstream. It cannot be recorded in a reusable pipeline because it connects two specific stream instances:

```javascript
left.sortedJoin(right, {
  leftKey: 'id',
  rightKey: 'parentId',
  type: 'left',
})
```

## Signature

```typescript
sortedJoin<Right>(
  right: Exstream<Right>,
  options: {
    leftKey: ((value: Left, context: object) => unknown) | keyof Left
    rightKey: ((value: Right, context: object) => unknown) | keyof Right
    type?: 'inner' | 'left' | 'right'
    order?: 'asc' | 'desc' | ((leftKey: unknown, rightKey: unknown) => number)
  },
): Exstream<SortedJoinResult<Key, Left, Right, Type>>
```

For an inner join both values are present. A left join returns `Right | null`; a right join returns `Left | null`.

## Related

[`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`merge()`](/docs/reference/merge/), [`sortBy()`](/docs/reference/sort-by/)
