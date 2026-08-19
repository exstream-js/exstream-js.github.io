---
playground: branching
---

<svelte:head>
  <title>Fork and observe — Exstream</title>
  <meta name="description" content="Choose reliable forks or non-blocking observers in an Exstream pipeline." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/branching/" />
</svelte:head>

<p class="eyebrow">Learn · Pipeline graphs</p>

# Fork and observe

<p class="lead">Use a reliable branch when every record must arrive. Use an observer when the main pipeline must never wait for it.</p>

## Reliable fork

```javascript
const source = exstream(records)
const database = source.fork()
const auditFile = source.fork()

await Promise.all([database.pipeTo(databaseWriter), auditFile.jsonlStringify().pipeTo(auditWriter)])
```

Every `fork()` participates in backpressure. The shared source advances only when all reliable branches can make progress. A slow audit destination may therefore slow the database branch too.

That behavior is correct when both outputs are required.

### Registering forks later

Automatic activation supports ordinary synchronous graph construction. If branch setup crosses a timer or `await`, make the root source manual and activate it explicitly:

```javascript
const source = exstream.defer(() => openRecords(), { start: 'manual' })
const database = source.fork().pipeTo(databaseWriter)

await prepareAuditWriter()
const audit = source.fork().pipeTo(auditWriter)

await source.start()
await Promise.all([database, audit])
```

Every fork still receives the complete shared execution. A fork created after `start()` is rejected; use a new deferred source execution when a later consumer needs to read independently.

## Non-blocking observer

```javascript
const metrics = source.observe({
  bufferLimit: 100,
  overflow: 'drop-oldest',
})
```

An observer does not slow the reliable flow. Because it can fall behind, it must have a buffer limit and overflow policy. Use it for metrics, sampling, and diagnostics—not required data.

## Failure boundary

A failed destination cancels its own fork. Reliable sibling branches can continue. The code that owns all terminal promises decides whether one failed branch should also abort the others.

## Decide in words first

For every branch, write one sentence:

- “Every record must reach this destination.” Use `fork()`.
- “Missing observations are acceptable.” Use `observe()` with a bound.

If neither sentence is true, the delivery contract is still undefined.
