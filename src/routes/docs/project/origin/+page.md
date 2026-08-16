<svelte:head>
  <title>Why Exstream exists</title>
  <meta
    name="description"
    content="The path from large streaming workloads and Highland experiments to Exstream's production years and renewed development."
  />
  <link rel="canonical" href="https://exstream-js.github.io/docs/project/origin/" />
</svelte:head>

<p class="eyebrow">Overview · History</p>

# Why Exstream exists

<p class="lead">Exstream did not begin as a framework pitch. It began because large datasets had to move through real systems without being collected entirely in memory.</p>

1. **Streaming work came first.** Large ETL workloads needed bounded memory, explicit backpressure, incremental formats, and more than one reliable destination.

2. **Highland showed a compelling shape.** Early experiments with [Highland](https://github.com/caolan/highland) demonstrated how pleasant a composable streaming API could be. Exstream borrows heavily from its ideas and should credit that lineage plainly.

3. **A new implementation became the learning project.** The first public commit landed on 9 August 2021, followed by `0.1.0` one week later. The goal was to modernize the model, explore the internals, and learn by building the machinery directly.

4. **Then it quietly did the job.** Exstream spent the following years serving across a range of production data pipelines. It accumulated practical behavior around pressure, lifecycle, formats, fan-out, and failure—mostly without the documentation or visibility to show it.

5. **Now the project gets daylight.** Development is active again: sharper contracts, new operators, browser and platform support, stronger tests, and documentation serious enough to expose what the library has already earned.

> Exstream was never a prototype waiting to become useful. It was useful software waiting to be explained.
