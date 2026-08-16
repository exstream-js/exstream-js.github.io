<svelte:head>
  <title>When to use Exstream</title>
  <meta name="description" content="Decide when Exstream solves a real pipeline problem and when a simpler JavaScript tool is clearer." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/project/when-not-to-use/" />
</svelte:head>

<p class="eyebrow">Learn · Adoption decision</p>

# When Exstream earns its place

<p class="lead">Use Exstream when the pipeline as a whole is difficult: bounded memory, controlled I/O, fan-out, failure, and cleanup. Do not use it to make a small loop look architectural.</p>

## Strong fit

Exstream is a strong fit when several of these are true:

- records can number in the millions;
- memory must remain bounded;
- I/O should run concurrently but not without limit;
- more than one reliable destination needs the same flow;
- failure and cancellation must clean up the complete graph;
- CSV, JSON Lines, or streamed JSON must be processed incrementally;
- one pipeline crosses iterables, Node streams, and Web Streams.

The value is not shorter syntax for `map()`. It is one explicit contract for the system those operations form.

## Data fits in memory

For a small collection already in memory, native methods are clearer and familiar:

```javascript
const activeNames = users.filter((user) => user.active).map((user) => user.name)
```

You do not need streaming semantics when there is no meaningful stream.

## One straight path

A single source, one or two transformations, and one destination may only need a loop:

```javascript
for await (const record of source) {
  if (!record.active) continue
  await destination.write(normalize(record))
}
```

Reach for Exstream when the loop starts accumulating concurrency pools, ordering queues, retries, fan-out, cancellation, format parsing, and cleanup rules.

## Native stream boundaries

If an existing Node.js or Web Streams pipeline already expresses the behavior safely, wrapping it brings little value. Exstream matters when you want one operator model across streams, iterables, async iterables, and multiple sinks.

## Analytical workloads

DuckDB, Polars, and Arrow are often better for large analytical joins, aggregations, scans, and columnar computation. Exstream is a record-oriented JavaScript pipeline, not a replacement for a query optimizer or a vectorized execution engine.

## Hot sources are not promises

An `EventEmitter` or `EventTarget` can produce events whether the consumer is ready or not. If the producer cannot pause and losing events is unacceptable, put a durable queue or broker at the boundary. An in-process library cannot manufacture backpressure that the source does not support.

## Decision test

Ask what code you would otherwise need to write: a concurrency pool, ordering queue, retry policy, fan-out coordinator, parser, cancellation graph, or cleanup protocol. If the answer is “none of those,” start with the platform. You can move to Exstream when the pipeline—not the syntax—becomes the problem.
