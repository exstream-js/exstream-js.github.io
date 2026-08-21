<svelte:head>
  <title>sortedGroupBy() — Exstream</title>
  <meta name="description" content="Stream adjacent Exstream groups from pre-sorted input, including keys, buffering, contexts, errors, and ordering requirements." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/sorted-group-by/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `sortedGroupBy()`

<p class="lead">Group adjacent equal keys while retaining only the current group.</p>

## Example

```javascript
const runs = exstream(rowsSortedByCustomer).sortedGroupBy('customerId')
```

## Parameters

<dl class="parameter-list"><div><dt><code>selector</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>function | string field</code></span><span><strong>Required</strong></span></p><p>Synchronous key callback or dot/bracket field path. Although the declaration accepts any property key, the runtime field shorthand recognizes strings only; use a callback for number or symbol fields.</p></dd></div></dl>

## Ordering contract

Input must already place equal keys contiguously. Keys compare with strict equality: objects by identity, `NaN` forms a new group each time, and `0` equals `-0`. The operator does not verify global sort order; a key appearing in separate runs produces separate output groups.

A group is emitted when the key changes or input ends. Memory is proportional to the largest adjacent group, not the whole stream, and downstream pressure propagates between groups. Values and contexts inside each group retain input order; output receives an aggregate context.

## Errors

Selector failures become contextual record errors. Existing errors pass through without flushing or changing the active group. Promise keys are not awaited.

## Forms

```javascript
stream.sortedGroupBy('customerId')
exstream.pipeline().sortedGroupBy('customerId')
```

## Signature

```typescript
sortedGroupBy<K>(
  selector: ((value: T, context: C) => K) | keyof T,
): Exstream<{ key: K; values: T[] }, AggregateContext<{ key: K; values: T[] }, C>>
```

## Related

[`groupBy()`](/docs/reference/group-by/), [`sortedJoin()`](/docs/reference/sorted-join/), [`sort()`](/docs/reference/sort/)
