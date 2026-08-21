<svelte:head><title>pipeline() — Exstream</title><meta name="description" content="Define reusable Exstream pipelines, including supported operators, type flow, instantiation, composition, state, and limitations." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/pipeline/" /></svelte:head>

<p class="eyebrow">API · Create</p>

# `pipeline()`

<p class="lead">Record a typed sequence of operators that can be attached to many independent sources.</p>

## Example

```typescript
const normalize = exstream
  .pipeline<RawOrder>()
  .filter((order) => order.active)
  .map((order) => ({ ...order, total: Number(order.total) }))

const firstRun = sourceA.through(normalize)
const secondRun = sourceB.through(normalize)
```

In Node, the same definition can become a native transform with a writable input and readable output:

```typescript
const transform = normalize.toNodeTransform()
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

Calling an operator on a pipeline records it without creating or running a source. `through(pipeline)` builds a fresh private chain, so buffers, contexts, seen-key sets, reducers, and lifecycle are independent per attachment.

Pipeline instantiation and the recorded operator list are implementation details: there is no public `generateStream()` method or mutable `definitions` array. Attach a definition with `through()`. Pipeline definitions remain fluent and mutable while being assembled; adding an operator changes future attachments, not live chains that were already attached.

Calling `drain()` on the definition takes a snapshot of its current operators and returns a `Destination<Input>`. It does not run the pipeline. Every later `pipeTo(destination)` builds a fresh chain from that snapshot.

`toNodeTransform()` also snapshots the current definition, but returns one native Node `Transform`. Calling it again creates an independent transform with fresh operator state.

## Supported methods

The typed pipeline surface contains reusable operators for transforms, selection, context, async work, error policies, parsers/stringifiers, range, aggregation, sorting, encoding, rate control, `sortedGroupBy()`, and nested `through()`. `drain()` closes the definition into a destination, while `toNodeTransform()` adapts it to Node's native stream interface.

Source, result-producing terminal, readable-adapter, and graph-specific methods such as `fork()`, `merge()`, `toArray()`, `pipeTo()`, `toNodeReadable()`, and `sortedJoin()` belong to instantiated Exstreams. Calling one on a pipeline definition throws immediately. TypeScript rejects the same invalid combinations before runtime.

## Errors

Operator arguments are generally validated when an instance is generated, not when the definition is recorded. Reusing a pipeline therefore reproduces the same validation and runtime error behavior for each source.

## Signature

```typescript
pipeline<T = unknown>(): Pipeline<T, T, RecordContext<T>>
```

## Related

[Composition](/docs/learn/composition/), [`through()`](/docs/reference/through/), [`toNodeTransform()`](/docs/reference/to-node-transform/), [`destination()`](/docs/reference/destination/), [`drain()`](/docs/reference/drain/), [`map()`](/docs/reference/map/)
