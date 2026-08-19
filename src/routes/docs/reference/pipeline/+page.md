<svelte:head><title>pipeline() — Exstream</title><meta name="description" content="Define reusable Exstream pipelines, including supported operators, type flow, instantiation, composition, state, and limitations." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/pipeline/" /></svelte:head>

<p class="eyebrow">API · Create</p>

# `pipeline()`

<p class="lead">Record a typed sequence of operators that can be attached to many independent sources.</p>

## Signature

```typescript
pipeline<T = unknown>(): Pipeline<T, T, RecordContext<T>>
```

## Example

```typescript
const normalize = exstream
  .pipeline<RawOrder>()
  .filter((order) => order.active)
  .map((order) => ({ ...order, total: Number(order.total) }))

const firstRun = sourceA.through(normalize)
const secondRun = sourceB.through(normalize)
```

A pipeline can instead be closed with `drain()` to define a reusable destination:

```typescript
const ordersApi = exstream
  .pipeline<Order>()
  .batch(200)
  .mapAsync(postOrders, { concurrency: 4, ordered: false })
  .drain()

await orders.pipeTo(ordersApi)
```

## Definition and instances

Calling an operator on a pipeline records its method name and arguments; it does not create or run a source. `through(pipeline)` calls `generateStream()` internally to build a fresh chain, so buffers, contexts, seen-key sets, reducers, and lifecycle are independent per attachment.

`generateStream()` is public and returns the writable head whose `endOfChain` points at the final operator, but `through()` is normally clearer. Pipelines are mutable definitions: adding an operator changes future instances, not ones already generated.

Calling `drain()` on the definition takes a snapshot of its current operators and returns a `Destination<Input>`. It does not run the pipeline. Every later `pipeTo(destination)` builds a fresh chain from that snapshot.

## Supported methods

The typed pipeline surface contains reusable operators for transforms, selection, context, async work, error policies, parsers/stringifiers, range, aggregation, sorting, encoding, rate control, `sortedGroupBy()`, and nested `through()`. `drain()` closes the definition into a destination. Source, result-producing terminal, and graph-specific methods such as `fork()`, `merge()`, `toArray()`, `pipeTo()`, and `sortedJoin()` belong to instantiated Exstreams.

## Errors

Operator arguments are generally validated when an instance is generated, not when the definition is recorded. Reusing a pipeline therefore reproduces the same validation and runtime error behavior for each source.

## Related

[`through()`](/docs/reference/through/), [`destination()`](/docs/reference/destination/), [`drain()`](/docs/reference/drain/), [`map()`](/docs/reference/map/)
