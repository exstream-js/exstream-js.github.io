<svelte:head>
  <title>History — Exstream</title>
  <meta
    name="description"
    content="How Exstream grew from JavaScript ETL work, Highland experiments, and several years of use in production pipelines."
  />
  <link rel="canonical" href="https://exstream-js.github.io/docs/project/origin/" />
</svelte:head>

<p class="eyebrow">Overview · History</p>

# History

<p class="lead">Exstream grew out of JavaScript ETL work on datasets that could not be collected entirely in memory.</p>

The original pipelines needed to process records incrementally, coordinate asynchronous I/O, respect slow destinations, and send the same input to more than one output. Node streams covered transport, but the application still had to implement much of that coordination itself.

Experiments with [Highland](https://github.com/caolan/highland) showed that a higher-level, composable stream API fit this work well. Exstream started as an independent implementation influenced by that model, both to adapt it to those pipelines and to understand the underlying machinery. The first public commit was made on 9 August 2021; version `0.1.0` followed one week later.

Over the following years, a small group used Exstream in production data pipelines. Requirements from that work shaped its behavior around backpressure, asynchronous concurrency, streaming formats, branching, lifecycle, and failures.

Development later resumed with a focus on making those behaviors explicit: revising the API, supporting Node.js and browser runtimes, strengthening tests and types, and documenting the contracts needed for a stable 1.0 release.
