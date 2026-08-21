<svelte:head>
  <title>API reference — Exstream</title>
  <meta name="description" content="Find Exstream operators by the job they perform and inspect their runtime contracts." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/" />
</svelte:head>

<p class="eyebrow">API reference</p>

# Operator index

<p class="lead">Find the complete public API by intent. Every page covers signatures, accepted values and defaults, execution, pressure, memory, context, errors, cancellation, runtimes, forms, and edge cases that change real behavior.</p>

## Create

- [`exstream()`](/docs/reference/exstream/) — adapt iterables, promises, platform streams, generators, or a writable source
- [`defer()`](/docs/reference/defer/) — create or acquire a source only when its graph is activated
- [`fromEvent()`](/docs/reference/from-event/) — adapt hot EventTarget and EventEmitter sources
- [`pipeline()`](/docs/reference/pipeline/) — define a reusable typed operator chain
- [`destination()`](/docs/reference/destination/) — define a reusable terminal consumer with setup and cleanup
- [`data()` and `nil`](/docs/reference/data/) — distinguish data from error and end control records

## Context

- [`withContext()`](/docs/reference/with-context/) and [`extendContext()`](/docs/reference/extend-context/) — attach synchronous or asynchronous record metadata
- [Stream state](/docs/reference/stream-state/) — inspect lifecycle, buffering, drops, pressure, and cancellation
- [Events](/docs/reference/events/) — observe errors, aborts, completion, fatal failures, and drain

## Transform

- [`map()`](/docs/reference/map/), [`flatMap()`](/docs/reference/flat-map/), and [`flatten()`](/docs/reference/flatten/) — reshape or expand values
- [`tap()`](/docs/reference/tap/) and [`compact()`](/docs/reference/compact/) — add synchronous effects or remove falsy values
- [`pluck()`](/docs/reference/pluck/), [`pick()`](/docs/reference/pick/), and [`omit()`](/docs/reference/omit/) — reshape object records
- [`batch()`](/docs/reference/batch/) — group records into bounded arrays

## Select

- [`filter()`](/docs/reference/filter/) and [`reject()`](/docs/reference/reject/) — keep or drop by synchronous predicate
- [`find()`](/docs/reference/find/), [`where()`](/docs/reference/where/), and [`findWhere()`](/docs/reference/find-where/) — find by predicate or shallow object match
- [`uniq()`](/docs/reference/uniq/) and [`uniqBy()`](/docs/reference/uniq-by/) — retain the first value for each identity or key
- [`slice()`](/docs/reference/slice/), [`take()`](/docs/reference/take/), [`drop()`](/docs/reference/drop/), [`head()`](/docs/reference/head/), and [`last()`](/docs/reference/last/) — select by position
- [`stopWhen()`](/docs/reference/stop-when/) — include the first match and stop the branch

## Aggregate and order

- [`collect()`](/docs/reference/collect/) and [`reduce()`](/docs/reference/reduce/) — produce one result after completion
- [`groupBy()`](/docs/reference/group-by/) and [`keyBy()`](/docs/reference/key-by/) — build a complete grouped or unique-key index
- [`sort()`](/docs/reference/sort/) — order a complete finite stream
- [`sortedGroupBy()`](/docs/reference/sorted-group-by/) — group adjacent equal keys without retaining the whole stream

## Async work

- [`mapAsync()`](/docs/reference/map-async/) — transform with concurrency, ordering, retry, local recovery, timeout, and cancellation controls
- [`makeAsync()`](/docs/reference/make-async/) — yield long synchronous pipelines to the event loop

## Flow control

- [`throttle()`](/docs/reference/throttle/) — drop values inside a time window
- [`ratelimit()`](/docs/reference/ratelimit/) — delay values to enforce a maximum rate

## Branch and combine

- [`fork()`](/docs/reference/fork/) — create a reliable branch participating in backpressure
- [`observe()`](/docs/reference/observe/) — create a non-blocking, explicitly buffered observer
- [`merge()`](/docs/reference/merge/) — consume a stream of streams with bounded concurrency
- [`through()`](/docs/reference/through/) — attach a pipeline, function, or Node transform
- [`sortedJoin()`](/docs/reference/sorted-join/) — merge-join exactly two pre-sorted streams

## Errors

- [Error API](/docs/reference/error-api/) — inspect record metadata, provenance, format errors, overflow, and timeouts
- [`errors()`](/docs/reference/errors/) and [`skipErrors()`](/docs/reference/skip-errors/) — recover, replace, or drop record errors
- [`failOnError()`](/docs/reference/fail-on-error/) and [`stopOnError()`](/docs/reference/stop-on-error/) — promote or stop at the first record error
- [`routeErrors()`](/docs/reference/route-errors/) — split data and dead letters into reliable branches

## Formats

- [`csv()`](/docs/reference/csv/) and [`csvStringify()`](/docs/reference/csv-stringify/) — incremental CSV parsing and serialization
- [`json()`](/docs/reference/json/) and [`jsonStringify()`](/docs/reference/json-stringify/) — stream one JSON document or array envelope
- [`jsonl()`](/docs/reference/jsonl/) and [`jsonlStringify()`](/docs/reference/jsonl-stringify/) — parse and serialize line-delimited JSON
- [`split()`](/docs/reference/split/) and [`splitBy()`](/docs/reference/split-by/) — decode and tokenize text across chunk boundaries
- [`encode()`](/docs/reference/encode/) and [`decode()`](/docs/reference/decode/) — transform streaming base64

## Consume

- [`pipeTo()`](/docs/reference/pipe-to/) — run an Exstream destination or write to a Node or Web writable
- [Async iteration](/docs/reference/async-iteration/) — consume one value per `for await` demand
- [`toArray()`](/docs/reference/to-array/), [`single()`](/docs/reference/single/), and [`drain()`](/docs/reference/drain/) — finish with uniform promise semantics

## Interop

- [`toWebReadable()`](/docs/reference/to-web-readable/) and [`toNodeReadable()`](/docs/reference/to-node-readable/) — expose platform readables from a source-backed Exstream
- [`toNodeTransform()`](/docs/reference/to-node-transform/) — expose a reusable pipeline as a native Node transform

## Low-level API

- [`write()`](/docs/reference/write/) and [`end()`](/docs/reference/end/) — implement manual sources
- [`consume()`](/docs/reference/consume/) and [`consumeSync()`](/docs/reference/consume-sync/) — build custom operators
- [`start()`](/docs/reference/start/) — freeze and activate an explicitly gated source graph
