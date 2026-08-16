<svelte:head>
  <title>uniqBy() — Exstream</title>
  <meta name="description" content="Keep the first Exstream value for each callback or field key, including composite keys, memory, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/uniq-by/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `uniqBy()`

<p class="lead">Keep the first value associated with each selected key or composite field tuple.</p>

## Signature

```typescript
uniqBy<K>(fn: (value: T, context: C) => K): Exstream<T, C>
uniqBy<K extends keyof T>(fields: K | readonly K[]): Exstream<T, C>
```

## Example

```javascript
const firstPerTenantEmail = exstream(users).uniqBy(['tenantId', 'email'])
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>selector</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>function | PropertyKey | readonly PropertyKey[]</code></span><span><strong>Required</strong></span></p>
      <p>A synchronous key function, one field, or a list of fields forming a composite key. A field selector uses direct property access; it does not interpret dot paths.</p>
    </dd>
  </div>
</dl>

## Keys and equality

A callback key is stored in a `Set` and uses SameValueZero equality; object keys compare by identity. Field selectors use a nested map for the complete tuple, avoiding ambiguous string concatenation. `['a', 'bc']` and `['ab', 'c']` are therefore distinct. An empty field array creates one empty tuple, so only the first input is emitted.

The first value for each key wins. Order and record context are preserved. Selection is synchronous and no output queue is added.

## Memory

The internal key index grows with distinct key cardinality until the branch ends. Do not use it on an infinite high-cardinality source unless that retention is acceptable.

## Errors

A thrown selector error or invalid property access becomes a record error for that input. Existing record errors pass through and are not indexed. Promise keys are not awaited and compare by promise identity.

## Forms

```javascript
stream.uniqBy('id')
exstream.pipeline().uniqBy(['tenantId', 'id'])
exstream.uniqBy((row) => row.id, stream)
stream.through(exstream.uniqBy('id'))
```

## Related

[`uniq()`](/docs/reference/uniq/), [`keyBy()`](/docs/reference/key-by/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/)
