<svelte:head>
  <title>Documentation — Exstream</title>
  <meta name="description" content="Learn Exstream from the first bounded pipeline to production semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/" />
</svelte:head>

<p class="eyebrow">Documentation</p>

# Build the pipeline, then learn its edges.

<p class="lead">Start with working code. Go deeper only when backpressure, concurrency, fan-out, errors, or cancellation become part of the problem.</p>

## Pick your path

### Working pipeline

The [quick start](/quick-start/) installs Exstream, transforms records, runs bounded asynchronous work, and writes to a destination that can push back.

### Understand behavior

Read [backpressure](/docs/concepts/backpressure/) before connecting a fast source to slow I/O. Every operator page will use the same contract: buffering, order, concurrency, errors, and cancellation.

### Adoption decision

Read [when not to use Exstream](/docs/project/when-not-to-use/). A small array, a simple async iterator, or a columnar engine can be the more honest answer.

## One-line model

```text
source → operators → sink
```

Nothing runs merely because the chain exists. A terminal consumer starts pulling. Demand travels toward the source; records and failures travel toward the sink.

> Exstream is for the pipeline as a whole: bounded memory, controlled I/O, fan-out, cancellation, format parsing, and cleanup.

## Runtime baseline

- Node.js 22 or newer
- ESM and CommonJS entry points
- Portable core for modern browsers
- Zero runtime dependencies
- TypeScript declarations included

The default import selects the Node.js or browser implementation through package exports. Use `exstream.js/node`, `exstream.js/core`, or `exstream.js/web` when the runtime boundary should be explicit.
