---
playground: merge-sources
---

<svelte:head>
  <title>Merge streams — Exstream</title>
  <meta name="description" content="Combine several Exstreams into one flow while controlling activation and output order." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/merge/" />
</svelte:head>

<p class="eyebrow">Learn · Pipeline graphs</p>

# Merge streams

<p class="lead">Use <code>merge()</code> when several Exstreams should feed the same downstream pipeline.</p>

## Rejoin processing lanes

Suppose routine payments can be approved immediately, while high-value payments require an asynchronous risk check. The input can be split into two branches and merged again before the common destination:

```javascript
const transactions = exstream(source('transactions')).take(120)

const routine = transactions
  .fork()
  .filter((transaction) => transaction.amount < 7500)
  .map((transaction) => ({ ...transaction, decision: 'approved' }))

const reviewed = transactions
  .fork()
  .filter((transaction) => transaction.amount >= 7500)
  .mapAsync(checkRisk, { concurrency: 6, ordered: false })

const decisions = exstream([routine, reviewed]).merge(2, false)

await decisions.pipeTo(decisionWriter)
```

The outer stream contains Exstreams. `merge()` consumes them and emits their records as one Exstream, so the destination does not need to know which lane produced a decision.

## Choose output order

The second argument controls how active inputs are emitted:

```javascript
exstream(streams).merge(4, false) // emit records from any input as soon as they are available
exstream(streams).merge(4, true) // finish each input in outer-stream order
```

Unordered mode is appropriate when records may interleave. Backpressure still reaches every active input.

Ordered mode preserves the order of the inner streams, not a global sort order. The current inner stream is emitted directly; later active streams are consumed and buffered until their turn. This is useful when resources must be drained promptly, but it can hold an entire later stream in memory. Keep ordered inner streams finite and reasonably sized.

## Defer resource acquisition

The first argument is the maximum number of active inner streams. Wrap an inner source in `defer()` when creating it also opens a file, request, cursor, or another limited resource:

```javascript
import { createReadStream } from 'node:fs'

const records = exstream(paths)
  .map((path) => exstream.defer(() => createReadStream(path)).jsonl())
  .merge(4, false)
```

Here at most four files are open at once. `merge()` activates at most four inner Exstreams, and each deferred source is acquired only when its inner is activated. The `defer()` factory may also be asynchronous.

If the inner sources are opened before `merge()` receives their streams, their resources may already be active. In that case, `parallelism` limits consumption but cannot undo work that has already started.

## Keep the operations distinct

- [`fork()`](/docs/learn/branching/) sends one execution into multiple branches.
- `merge()` consumes multiple live streams as one output.
- [`flatMap()`](/docs/reference/flat-map/) expands values or synchronous iterables; it does not coordinate live streams.

Record errors from any input continue downstream. Fatal failures and cancellation stop active inner work; deferred sources outside the activation window are never acquired. See the [`merge()` reference](/docs/reference/merge/) for the complete ordering, buffering, and error contract.
