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

## Definition and instances

Calling an operator on a pipeline records its method name and arguments; it does not create or run a source. `through(pipeline)` calls `generateStream()` internally to build a fresh chain, so buffers, contexts, seen-key sets, reducers, and lifecycle are independent per attachment.

`generateStream()` is public and returns the writable head whose `endOfChain` points at the final operator, but `through()` is normally clearer. Pipelines are mutable definitions: adding an operator changes future instances, not ones already generated.

## Supported methods

The typed pipeline surface contains reusable non-terminal operators: transforms, selection, context, async work, error policies, parsers/stringifiers, range, aggregation, sorting, encoding, rate control, `sortedGroupBy()`, and nested `through()`. Source/terminal/graph-specific methods such as `fork()`, `merge()`, `pipeTo()`, `sortedJoin()`, and `values()` belong to instantiated Exstreams.

## Errors

Operator arguments are generally validated when an instance is generated, not when the definition is recorded. Reusing a pipeline therefore reproduces the same validation and runtime error behavior for each source.

## Related

[`through()`](/docs/reference/through/), [`exstream()`](/docs/reference/exstream/), [`map()`](/docs/reference/map/)
