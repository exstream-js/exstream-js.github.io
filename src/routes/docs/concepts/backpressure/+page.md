---
playground: backpressure
---

<svelte:head>
  <title>Backpressure — Exstream</title>
  <meta name="description" content="How backpressure moves through an Exstream pipeline and keeps memory bounded." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/concepts/backpressure/" />
</svelte:head>

<p class="eyebrow">Core concept</p>

# Backpressure is a graph property

<p class="lead">A fast source must not outrun the slowest reliable destination. Exstream carries that demand through transforms, asynchronous work, and branches.</p>

## Short version

```text
fast source → transform → slow writer
     ↑                         │
     └────── demand ───────────┘
```

The writer accepts one record at a time. That capacity travels upstream. The source pulls the next input only when the connected graph can make progress.

Backpressure is not a speed boost. It is what keeps a speed difference from turning into an ever-growing memory buffer.

## `mapAsync()` bounds

```javascript
const enriched = exstream(records).mapAsync(loadCustomer, {
  concurrency: 16,
  ordered: true,
})
```

`concurrency: 16` bounds active calls plus completed results waiting for downstream demand. Every result accepted downstream releases one slot and permits one replacement input. With `ordered: true`, a later result may need to wait for an earlier one, so ordering contributes to the retained window. Both choices belong in the operator contract.

<div class="contract-grid">
  <div><strong>Input</strong><span>Pulled on demand</span></div>
  <div><strong>Active work</strong><span>Bounded by concurrency</span></div>
  <div><strong>Output order</strong><span>Preserved by default</span></div>
  <div><strong>Abort</strong><span>Stops useless work</span></div>
</div>

## Branches vs observers

`fork()` is reliable: every branch participates in backpressure. If one branch is slow, the shared source must respect it.

`observe()` is best-effort: it does not slow the main flow. Because a non-blocking observer can fall behind, it needs an explicit buffer limit and overflow policy. Use it for metrics, sampling, and diagnostics—not for data that must arrive.

## Source limits

A pull-based async iterator naturally waits until the next pull. A pausable Node.js stream can stop producing temporarily. An `EventEmitter` or `EventTarget` may be hot and non-pausable: once events arrive, software can only buffer, drop, or fail.

> An API can preserve backpressure semantics only where the source primitive makes pressure possible. Hot sources need an explicit overflow decision.

## Review checklist

Before shipping a pipeline, answer these questions:

1. Which destination is allowed to set the pace?
2. How many records can each asynchronous operator retain?
3. Does preserving order add head-of-line blocking?
4. Are all `fork()` branches actually reliable?
5. What happens when a hot event source outruns the pipeline?
6. Which signal cancels work after a failure or early stop?

If one answer is “unbounded,” that is the part of the graph to redesign.
