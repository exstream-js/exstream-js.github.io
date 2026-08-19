<svelte:head>
  <title>fork() — Exstream</title>
  <meta name="description" content="Create a reliable Exstream branch with complete startup, backpressure, context, and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/fork/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `fork()`

<p class="lead">Create an independent reliable branch that participates in shared-source backpressure.</p>

## Example

```javascript
const source = exstream(records)
const database = source.fork()
const audit = source.fork()

await Promise.all([database.pipeTo(databaseWriter), audit.jsonlStringify().pipeTo(auditWriter)])
```

Create all branches synchronously, before the source starts.

## Delivery

Every fork receives every source record in order. The shared source advances only after each active reliable branch can accept the record, so the slowest fork controls throughput. No drop policy is available on a reliable fork.

Contexts are copied at the branch boundary. Mutating one branch's context does not mutate its sibling's context object.

## Lifecycle

Calling `fork()` after the root source has started throws. A branch that terminates early detaches from the shared source. A failure in one terminal destination cancels that fork; reliable siblings may continue, so application code awaiting several branches decides whether to cancel them together through their owning signals.

For branches registered in different turns, create the root source with `{ start: 'manual' }`. Terminal consumers may then be attached before or after awaited setup without starting source work. Call `start()` after the final reliable fork; await the branch terminal operations for completion.

Use [`observe()`](/docs/reference/observe/) when observation must never slow the reliable flow and data loss is acceptable.

## Forms

`fork()` is a graph operation on a concrete stream. It is not available on reusable pipeline definitions and has no standalone operator form because it must attach to one live source instance.

## Signature

```typescript
fork(): Exstream<T, C>
```

## Related

[`observe()`](/docs/reference/observe/), [`merge()`](/docs/reference/merge/), [branch and observe](/docs/learn/branching/)
