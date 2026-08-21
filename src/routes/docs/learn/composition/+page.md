---
playground: composition
---

<svelte:head>
  <title>Composition — Exstream</title>
  <meta name="description" content="Compose reusable Exstream operator functions and pipeline definitions with through()." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/composition/" />
</svelte:head>

<p class="eyebrow">Learn · Composition</p>

# Composition

<p class="lead">Turn transformations into small reusable pieces, then attach them to live streams with <code>through()</code>. Composition stays local: no registration, global mutation, or special plugin protocol is involved.</p>

## Operator functions

An operator function receives an Exstream and returns the transformed Exstream:

```javascript
const multiply = (factor) => (stream) => stream.map((value) => value * factor)

const totalsInCents = totals.through(multiply(100))
```

`through()` calls the function with the current stream and returns its result. It adds no queue, scheduler, error boundary, or lifecycle of its own, so the operators inside retain their normal backpressure, errors, context, and cancellation behavior.

Because the extension point is an ordinary function, reusable operators are ordinary JavaScript modules too:

```javascript
// order-operators.js
export const paidOnly = (stream) => stream.filter((order) => order.status === 'paid')

export const enrichCustomers = (loadCustomer) => (stream) =>
  stream.mapAsync(
    async (order) => ({
      ...order,
      customer: await loadCustomer(order.customerId),
    }),
    { concurrency: 8 },
  )
```

Callers import only what they use, dependencies remain explicit, and two packages cannot overwrite each other's stream methods.

## Reusable pipelines

Use `pipeline()` when the reusable piece is a fixed chain of existing operators:

```javascript
const normalizeOrder = exstream
  .pipeline()
  .filter((order) => order.total != null)
  .map((order) => ({ ...order, total: Number(order.total) }))

const fromApi = exstream(apiOrders).through(normalizeOrder)
const fromFile = exstream(csvRows).through(normalizeOrder)
```

A pipeline definition is a recipe, not a live stream. Building it does not acquire a source or process data. Every `through(normalizeOrder)` attachment creates a fresh chain, so buffers, reducers, seen-key sets, and other operator state are independent.

Pipeline definitions are useful when the shape is fixed and the input changes. Operator functions are useful when the transformation needs parameters, dependencies, branching logic, or a name that expresses domain intent.

## Compose both forms

Functions and pipelines use the same attachment point and can contain each other:

```javascript
const prepareOrders = exstream
  .pipeline()
  .through(paidOnly)
  .through(normalizeOrder)
  .through(enrichCustomers(loadCustomer))

await exstream(orders).through(prepareOrders).pipeTo(orderWriter)
```

The outer pipeline records the three composition steps. Attaching it later creates one fresh live graph, including fresh instances of `normalizeOrder` and every stateful operator it contains.

Composition also works incrementally on a live stream:

```javascript
const prepared = exstream(orders)
  .through(paidOnly)
  .through(normalizeOrder)
  .through(enrichCustomers(loadCustomer))
```

Choose the smallest abstraction that expresses the behavior:

| Goal                                            | Primitive                      |
| ----------------------------------------------- | ------------------------------ |
| Write one local chain                           | fluent instance methods        |
| Reuse a fixed operator chain                    | `pipeline()`                   |
| Name or parameterize a transformation           | function + `through()`         |
| Implement behavior the built-ins cannot express | `consumeSync()` or `consume()` |
| Package reusable terminal behavior              | `destination()`                |

The fourth case is deliberately separate. If composition of existing operators is not enough, continue with [Extensibility](/docs/learn/extensibility/) after learning the rest of the lifecycle and error model.

## Composition boundaries

`through()` is transparent to the data flow but useful as an architectural boundary. A function can hide implementation details without hiding its dependencies or changing how the graph runs.

A reusable piece should return an Exstream and leave terminal consumption to its caller. Starting `pipeTo()`, `toArray()`, or another terminal inside an operator changes the function from a transformation into a running job and makes it much harder to compose.

## Related

[`through()`](/docs/reference/through/), [`pipeline()`](/docs/reference/pipeline/), [`destination()`](/docs/reference/destination/), [Extensibility](/docs/learn/extensibility/)
