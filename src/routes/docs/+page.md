<svelte:head>
  <title>What is Exstream?</title>
  <meta name="description" content="What Exstream is, the sources and destinations it connects, and the streaming pipeline problems it handles." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/" />
</svelte:head>

<p class="eyebrow">Overview</p>

# What is Exstream?

<p class="lead">Exstream is a JavaScript framework for building record-oriented streaming data pipelines in Node.js and modern browsers.</p>

A pipeline reads values from an iterable, async iterable, Node stream, Web Stream, generator, or promise; applies a chain of operators; and sends the results to a terminal consumer or destination.

It is meant for flows that should be processed incrementally and need more coordination than a simple loop provides: bounded asynchronous work, backpressure from slow destinations, branching and merging, streaming formats, and consistent error and cancellation handling.

## The same Node pipeline

Suppose `source` and `destination` are Node.js object-mode streams. Keeping approved transactions and reshaping them with native streams requires a `Transform` implementation:

```javascript
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const selectApproved = new Transform({
  objectMode: true,
  transform(transaction, _encoding, callback) {
    if (transaction.status !== 'approved') {
      callback()
      return
    }

    callback(null, {
      id: transaction.id,
      amountInCents: Math.round(transaction.amount * 100),
    })
  },
})

await pipeline(source, selectApproved, destination)
```

Exstream accepts those same Node streams and expresses the record operations directly:

```javascript
await exstream(source)
  .filter((transaction) => transaction.status === 'approved')
  .map((transaction) => ({
    id: transaction.id,
    amountInCents: Math.round(transaction.amount * 100),
  }))
  .pipeTo(destination)
```

## What Exstream adds

- **One API across runtimes.** Pipelines accept iterables, async iterables, promises, Node streams, and Web Streams, and can write to Node or Web destinations.
- **Record operations without stream plumbing.** Selection, transformation, aggregation, streaming formats, joins, grouping, and sorting are regular operators rather than custom stream classes.
- **Explicit flow control.** Slow destinations propagate backpressure; `mapAsync()` bounds asynchronous work and controls output order; `fork()`, `observe()`, and `merge()` describe how data moves between branches.
- **One lifecycle for the complete flow.** Errors retain their input and stage, cancellation propagates through connected work, and terminal methods expose completion as promises.

Exstream is not a database, a message broker, or a faster replacement for native array methods. See [when to use it](/docs/project/when-not-to-use/) for the cases where those pipeline mechanics are useful.
