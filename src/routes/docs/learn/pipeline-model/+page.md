<script>
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
</script>

<svelte:head>
  <title>Pipeline model — Exstream</title>
  <meta name="description" content="Understand sources, operators, terminal consumers, laziness, and demand in an Exstream pipeline." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/pipeline-model/" />
</svelte:head>

<p class="eyebrow">Learn · Mental model</p>

# Pipeline model

<p class="lead">An Exstream pipeline connects a source to transformations and a terminal consumer. The consumer starts the work and controls when the next record is useful.</p>

## Three parts

```text
source → operators → sink
```

A [**source**](/docs/learn/sources/) may be an iterable, async iterable, Web `ReadableStream`, Node-readable stream, promise, or Exstream generator. It produces the original values.

**Operators** transform the flow. `map()` changes values, `filter()` removes them, `mapAsync()` coordinates asynchronous work, and format operators turn chunks into records or records into chunks.

A **terminal consumer** creates downstream demand. Examples include `pipeTo()`, async iteration, `drain()`, and `toArray()`.

## Chains are lazy

```javascript
const activeOrders = exstream(source)
  .map(normalizeOrder)
  .filter((order) => order.active)
```

This code describes a pipeline. It does not consume the source yet. Work begins when something asks `activeOrders` for values:

```javascript
for await (const order of activeOrders) {
  await saveOrder(order)
}
```

<PlaygroundLink example="pipeline-model" />

That distinction matters for files, network responses, and generators with side effects. Constructing a pipeline is not the same as running it.

## Demand moves upstream

The consumer asks for capacity. Operators pass that demand toward the source. Values travel back toward the consumer. A slow destination therefore influences when the source is read again.

This is the basis of [backpressure](/docs/concepts/backpressure/). It is also why a terminal operation should be visible in application code: it identifies who owns completion and failure.

## Synchronous work, predictable completion

With a synchronous source and synchronous operators, Exstream keeps a synchronous path:

```javascript
const values = await exstream([1, 2, 3])
  .map((value) => value * 2)
  .toArray()
```

Synchronous operators still process records synchronously. Terminal methods nevertheless return promises whether the pipeline is synchronous or asynchronous, so changing a source or adding `mapAsync()` does not change the caller's contract.

## Next

Continue with [transform data](/docs/learn/transform-data/) or jump to [consume a pipeline](/docs/learn/consume/) if the terminal boundary is your immediate problem.
