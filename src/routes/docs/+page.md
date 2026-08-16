<svelte:head>
  <title>Documentation — Exstream</title>
  <meta name="description" content="Learn the Exstream pipeline model, solve streaming ETL problems, and look up operator contracts." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/" />
</svelte:head>

<p class="eyebrow">Documentation</p>

# Choose what you need

<p class="lead">Learn the model in order, solve a concrete ETL problem, or look up the exact contract of one operator.</p>

## New to Exstream?

Start with the [quick start](/quick-start/) if you have not run a pipeline yet. Then read the [pipeline model](/docs/learn/pipeline-model/) and [backpressure](/docs/concepts/backpressure/). Together they explain when work starts, who controls the pace, and why the pipeline stays bounded.

```text
source → transformations → terminal consumer
   ↑                              │
   └──────────── demand ──────────┘
```

## Solving a problem?

Guides begin with a real task and end with a complete pipeline. The first one [fetches and transforms a public CSV in the browser](/docs/examples/browser-csv/) without a server or upload.

More guides will cover bounded enrichment, multiple writers, paginated APIs, dead-letter flows, and hot event sources. They belong here only when their code can be verified against a released package.

## Looking up an operator?

Use the [operator index](/docs/reference/). Reference pages state the details production code depends on: input and output, sync or async execution, order, concurrency, buffering, backpressure, errors, cancellation, and runtime support.

## Deciding whether to adopt it?

Read [when to use Exstream](/docs/project/when-not-to-use/). Native arrays, a small `for await` loop, Web Streams, or a columnar engine can all be the better answer. Exstream earns its place when the pipeline as a whole becomes the difficult part.

## Runtime baseline

- Node.js 22 or newer
- ESM and CommonJS entry points
- Portable core for modern browsers
- Zero runtime dependencies
- TypeScript declarations included

The default import selects the Node.js or browser implementation through package exports. Explicit entry points are available as `exstream.js/node`, `exstream.js/core`, and `exstream.js/web`.
