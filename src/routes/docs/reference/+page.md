<svelte:head>
  <title>API reference — Exstream</title>
  <meta name="description" content="Find Exstream operators by the job they perform and inspect their runtime contracts." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/" />
</svelte:head>

<p class="eyebrow">API reference</p>

# Operator index

<p class="lead">Find an operator by intent. Every completed reference page documents behavior, not only syntax.</p>

## Transform

- [`map()`](/docs/reference/map/) — transform every value synchronously
- [`filter()`](/docs/reference/filter/) — keep values that pass a test
- [`flatMap()`](/docs/reference/flat-map/) — expand one value into several values
- [`tap()`](/docs/reference/tap/) — run a side effect without changing the value
- `pick()`, `omit()`, `pluck()` — reshape object records
- [`batch()`](/docs/reference/batch/) — group records into bounded arrays
- [`collect()`](/docs/reference/collect/) — buffer the complete input into one array

## Async work

- [`mapAsync()`](/docs/reference/map-async/) — transform with bounded concurrency, order, retry, and timeout
- `asyncFilter()` — select values with an asynchronous test
- [`resolve()`](/docs/reference/resolve/) — resolve promise values with bounded parallelism
- `asyncReduce()` — aggregate with asynchronous work

## Branch and combine

- [`fork()`](/docs/reference/fork/) — create a reliable branch that participates in backpressure
- [`observe()`](/docs/reference/observe/) — create a non-blocking, explicitly buffered observer
- [`merge()`](/docs/reference/merge/) — consume a stream of streams with bounded parallelism
- [`through()`](/docs/reference/through/) — attach a reusable pipeline or transform

## Errors

- [`errors()`](/docs/reference/errors/) — handle record errors and optionally emit replacements
- [`skipErrors()`](/docs/reference/skip-errors/) — drop selected record errors
- [`routeErrors()`](/docs/reference/route-errors/) — split values and errors into separate streams
- `failOnError()` — promote the first record error to a fatal failure

## Formats

- [`csv()`](/docs/reference/csv/) and [`csvStringify()`](/docs/reference/csv-stringify/)
- [`json()`](/docs/reference/json/) and [`jsonStringify()`](/docs/reference/json-stringify/)
- [`jsonl()`](/docs/reference/jsonl/) and [`jsonlStringify()`](/docs/reference/jsonl-stringify/)
- `split()`, `encode()`, and `decode()`

## Consume

- [`pipeTo()`](/docs/reference/pipe-to/) — write to a destination and await completion
- [`toAsyncIterator()`](/docs/reference/to-async-iterator/) — consume with `for await`
- `toWebReadable()` and `toNodeStream()` — expose platform stream primitives
- [`drain()`](/docs/reference/drain/) — run to completion and discard output
- `values()`, `valuesSync()`, and `toPromise()` — collect deliberately

## Reference contract

A method is not considered fully documented until its page states input and output, execution mode, backpressure, buffering, order, concurrency, errors, cancellation, supported runtimes, hot-source behavior, and relevant edge cases. Unlinked entries above are part of the public API but still need that editorial pass.
