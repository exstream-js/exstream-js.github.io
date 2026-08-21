<svelte:head>
  <title>groupBy() — Exstream</title>
  <meta name="description" content="Collect an Exstream into arrays grouped by a key, including selectors, memory, duplicate keys, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/group-by/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `groupBy()`

<p class="lead">Collect the entire stream into an object whose keys map to arrays of matching values.</p>

## Example

```javascript
const byRegion = await exstream(customers).groupBy('region').single()
// { eu: [...], us: [...] }
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>selector</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>function | string field</code></span><span><strong>Required</strong></span></p><p>A synchronous key callback or string field path. String selectors support dot/bracket traversal. The declaration currently permits any property key, but the runtime shorthand recognizes strings only; use a callback for number or symbol fields. Returned keys should be strings, numbers, or symbols; objects are coerced by normal property assignment.</p></dd></div>
</dl>

## Behavior

All successful input is consumed before one grouped object is emitted. Values inside each group retain input order. A `null`, `undefined`, or missing key is stored under Exstream's `nil` symbol, so it is accessible through symbol enumeration but omitted by ordinary JSON serialization.

The result carries an aggregate context. Existing record errors pass through and are not included.

## Buffering

`groupBy()` retains every successful value in its group until the source ends. It needs the end signal before it can know that the grouped object is complete, so memory use grows with the entire input and unbounded streams never produce a result.

Use [`sortedGroupBy()`](/docs/reference/sorted-group-by/) when equal keys are adjacent: it emits each completed group incrementally and only retains the current group.

## Errors

A selector failure becomes a record error and terminates the underlying reduction without a grouped result. Promise keys are not awaited.

## Forms

```javascript
stream.groupBy('region')
exstream.pipeline().groupBy('region')
```

## Signature

```typescript
groupBy<K extends PropertyKey>(
  selector: ((value: T, context: C) => K) | keyof T,
): Exstream<Record<K, T[]>, AggregateContext<Record<K, T[]>, C>>
```

## Related

[`keyBy()`](/docs/reference/key-by/), [`sortedGroupBy()`](/docs/reference/sorted-group-by/), [`reduce()`](/docs/reference/reduce/)
