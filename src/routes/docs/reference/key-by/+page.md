<svelte:head>
  <title>keyBy() — Exstream</title>
  <meta name="description" content="Index an Exstream by a unique key, including duplicate handling, memory, selectors, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/key-by/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `keyBy()`

<p class="lead">Collect the complete stream into an object indexed by a unique key.</p>

## Example

```javascript
const usersById = await exstream(users).keyBy('id').single()
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>selector</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>function | string field</code></span><span><strong>Required</strong></span></p><p>A synchronous key callback or a dot/bracket field path. The declaration currently permits any property key, but the runtime shorthand recognizes strings only; use a callback for number or symbol fields. Every successful input must produce a unique property key.</p></dd></div>
</dl>

## Behavior

All values are retained until upstream ends, then one object is emitted. A `null`, `undefined`, or missing key becomes Exstream's `nil` symbol. Number keys follow JavaScript object-key coercion. The result has an aggregate context; existing record errors pass through and are excluded.

## Duplicate keys

The first duplicate is an error rather than “first wins” or “last wins.” Exstream emits a record error with message `Multiple values per key: …` for that input and terminates this aggregation, so no partial index is emitted. Use [`groupBy()`](/docs/reference/group-by/) when multiple values per key are valid, or [`uniqBy()`](/docs/reference/uniq-by/) when the first should win.

## Forms

```javascript
stream.keyBy('id')
exstream.pipeline().keyBy('id')
exstream.keyBy((row) => row.id, stream)
stream.through(exstream.keyBy('id'))
```

## Signature

```typescript
keyBy<K extends PropertyKey>(
  selector: ((value: T, context: C) => K) | keyof T,
): Exstream<Record<K, T>, AggregateContext<Record<K, T>, C>>
```

## Related

[`groupBy()`](/docs/reference/group-by/), [`uniqBy()`](/docs/reference/uniq-by/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/)
