<svelte:head>
  <title>fork() — Exstream</title>
  <meta name="description" content="Create a reliable Exstream branch with complete startup, backpressure, context, and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/fork/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `fork()`

<p class="lead">Create an independent reliable branch that participates in shared-source backpressure.</p>

## Signature

```typescript
fork(disableAutostart?: boolean): Exstream<T, C>
```

## Example

```javascript
const source = exstream(records)
const database = source.fork()
const audit = source.fork()

await Promise.all([database.pipeTo(databaseWriter), audit.jsonlStringify().pipeTo(auditWriter)])
```

Create all branches synchronously, before the source starts.

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>disableAutostart</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>By default, Exstream schedules the shared source to start after the current synchronous setup turn. Pass <code>true</code> to wire branches without that scheduled start, then call <code>source.start()</code> explicitly.</p>
    </dd>
  </div>
</dl>

## Delivery

Every fork receives every source record in order. The shared source advances only after each active reliable branch can accept the record, so the slowest fork controls throughput. No drop policy is available on a reliable fork.

Contexts are copied at the branch boundary. Mutating one branch's context does not mutate its sibling's context object.

## Lifecycle

Calling `fork()` after the source has started throws. A branch that is destroyed detaches from the shared source. A failure in one terminal destination cancels that fork; reliable siblings may continue, so application code awaiting several branches decides whether to abort them together.

Use [`observe()`](/docs/reference/observe/) when observation must never slow the reliable flow and data loss is acceptable.

## Forms

`fork()` is a graph operation on a concrete stream. It is not available on reusable pipeline definitions and has no standalone operator form because it must attach to one live source instance.

## Related

[`observe()`](/docs/reference/observe/), [`merge()`](/docs/reference/merge/), [branch and observe](/docs/learn/branching/)
