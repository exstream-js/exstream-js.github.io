---
playground: transform-data
---

<svelte:head>
  <title>Transform data — Exstream</title>
  <meta name="description" content="Transform streaming records with familiar operators and reuse operator chains with pipeline() and through()." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/transform-data/" />
</svelte:head>

<p class="eyebrow">Learn</p>

# Transform data

Transformation chains look similar to native array operations, but their input can be a file, response body, async iterable, or another stream. Records pass through the chain as downstream asks for them; the complete source is not turned into an array first.

## Familiar record operations

This pipeline keeps paid orders, expands their items into invoice lines, removes empty quantities, and calculates each line total:

```javascript
const invoiceLines = exstream(orders)
  .filter((order) => order.status === 'paid')
  .flatMap((order) =>
    order.items.map((item) => ({
      orderId: order.id,
      customerId: order.customerId,
      sku: item.sku,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
    })),
  )
  .filter((line) => line.quantity > 0)
  .map((line) => ({
    ...line,
    totalInCents: line.quantity * line.unitPriceInCents,
  }))
```

The callbacks serve the same purpose as `Array.prototype.filter()`, `flatMap()`, and `map()`. The difference is execution: one order can enter from the source and its invoice lines can continue downstream before later orders have been read.

Operators can also change the unit of the flow. If invoice lines are already ordered by customer, they can be grouped and summarized one customer at a time, then sent to a destination in bounded batches:

```javascript
const invoiceBatches = exstream(linesSortedByCustomer)
  .sortedGroupBy('customerId')
  .map(({ key: customerId, values: lines }) => ({
    customerId,
    lineCount: lines.length,
    totalInCents: lines.reduce((total, line) => total + line.totalInCents, 0),
  }))
  .batch(100)
```

Here `sortedGroupBy()` retains the current customer group and `batch(100)` retains at most 100 summaries. Operators such as a complete `sort()` or `toArray()` have different retention requirements; their reference pages state them explicitly.

When a transformation performs asynchronous I/O, use `mapAsync()` to state its concurrency and output-order policy:

```javascript
const pricedLines = invoiceLines.mapAsync(loadCurrentPrice, {
  concurrency: 8,
  ordered: true,
})
```

See the [operator index](/docs/reference/) for the complete list of transformations and [Async processing](/docs/learn/async-work/) for `mapAsync()` behavior.

## Reusable pipelines

A reusable pipeline records an operator chain without attaching a source or a destination:

```javascript
const normalizePayments = exstream
  .pipeline()
  .filter((payment) => payment.status === 'captured')
  .map((payment) => ({
    id: payment.id,
    accountId: payment.accountId,
    amountInCents: Math.round(payment.amount * 100),
  }))
  .uniqBy('id')
```

Attach it to any compatible Exstream with `through()`:

```javascript
const webPayments = exstream(webPaymentSource).through(normalizePayments)
const retailPayments = exstream(retailPaymentSource).through(normalizePayments)
```

Each call to `through()` creates an independent operator chain. State held by operators such as `uniqBy()` or `batch()` is not shared between attachments. The resulting values are ordinary Exstreams and can continue through more operators or a terminal destination.

Read the [`pipeline()`](/docs/reference/pipeline/) and [`through()`](/docs/reference/through/) references for supported operators, composition, types, and attachment behavior.
