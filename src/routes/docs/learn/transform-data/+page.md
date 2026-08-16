<svelte:head>
  <title>Transform data — Exstream</title>
  <meta name="description" content="Use Exstream transformations without collecting the complete source." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/transform-data/" />
</svelte:head>

<p class="eyebrow">Learn · Operators</p>

# Transform data

<p class="lead">Most operators receive one record, return or select a value, and preserve demand through the chain.</p>

## Map values

```javascript
const orders = exstream(rows).map((row) => ({
  id: row.order_id,
  total: Number(row.total),
  active: row.status === 'active',
}))
```

`map()` is synchronous. It transforms every input into exactly one output and TypeScript follows the returned value through the chain.

## Select records

```javascript
const activeOrders = orders.filter((order) => order.active)
```

`filter()` preserves the original order and does not create its own concurrency. A TypeScript type predicate can narrow the value type.

## Expand or batch

Use `flatMap()` when one record produces an iterable of records. Use `batch(size)` when the destination works more efficiently on bounded groups:

```javascript
const batches = activeOrders.batch(100)

for await (const batch of batches.toAsyncIterator()) {
  await database.insertMany(batch)
}
```

Batching deliberately retains up to the requested number of values. That memory belongs in the pipeline design, not in an accidental array outside it.

## Avoid hidden I/O in `map()`

Returning a promise from `map()` produces promise values; it does not apply a concurrency policy. Use `mapAsync()` when the transform performs I/O:

```javascript
const enriched = orders.mapAsync(loadCustomer, {
  concurrency: 8,
  ordered: true,
})
```

Continue with [async work and order](/docs/learn/async-work/) for the retention and ordering consequences.
