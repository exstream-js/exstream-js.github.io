<svelte:head>
  <title>routeErrors() — Exstream</title>
  <meta name="description" content="Split Exstream values and recoverable errors into reliable branches with complete output, pressure, and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/route-errors/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `routeErrors()`

<p class="lead">Split successful values and recoverable record errors into two reliable branches.</p>

## Example

```javascript
const { output, deadLetters } = pipeline.routeErrors()

await Promise.all([output.pipeTo(destination), deadLetters.map(formatDeadLetter).pipeTo(rejects)])
```

## Outputs

`output` receives every successful value and no record errors. `deadLetters` receives one `{ error, input }` object for every record error, where `input` is the original `error.exstreamInput`. Both branches preserve their relevant source order and record contexts.

An `Error` intentionally wrapped with `exstream.data(error)` is ordinary data and travels through `output`.

## Pressure

Both outputs are reliable forks. Consume them concurrently: the source advances only when both active branches can accept their next relevant record. Leaving either output without demand can stop the graph.

Call `routeErrors()` before the source starts because it creates both forks synchronously. Like `fork()`, it throws if reliable branches can no longer be added.

## Errors

Fatal source, sink, lifecycle, and cancellation failures bypass dead-letter routing and abort both branches. A structural CSV or single-document JSON failure may be emitted briefly as a dead letter before its format operator aborts the graph; routing it cannot make a partial document recoverable. Failures inside one downstream destination affect that branch according to normal fork lifecycle; coordinate sibling cancellation at the application boundary when required.

## Forms

`routeErrors()` operates on a live stream and returns live branches. Use the instance method or pass the stream to the standalone function; it is not available on reusable pipeline definitions:

```javascript
stream.routeErrors()
exstream.routeErrors(stream)
```

## Signature

```typescript
routeErrors(): {
  output: Exstream<T, C>
  deadLetters: Exstream<{ error: ExstreamError<T>; input: T }, C>
}
```

## Related

[`errors()`](/docs/reference/errors/), [`skipErrors()`](/docs/reference/skip-errors/), [`fork()`](/docs/reference/fork/)
