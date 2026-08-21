<svelte:head><title>consumeSync() — Exstream</title><meta name="description" content="Build a custom synchronous Exstream operator with the error/value/push protocol, context propagation, pressure, and errors." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/consume-sync/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `consumeSync()`

<p class="lead">Build a custom synchronous operator that handles one protocol record at a time.</p>

## Protocol

The callback receives successful data, a record error, or the `exstream.nil` end marker. Use `push(null, output)` to emit data, `push(error)` to emit an error, and `push(null, exstream.nil)` to end. It may emit zero, one, or many records per input.

The callback must finish synchronously. For awaiting, delayed continuation, or explicit read control, use `consume()`. Output order follows callback push order; downstream pressure is reflected by `push()` and the connected graph.

## Context and errors

`push()` inherits the active input context by default. A third context argument replaces it. Existing errors and end are not forwarded unless the callback pushes them. Avoid uncaught callback exceptions; standard operators wrap them with defined provenance, while low-level consumers leave policy to the adapter author.

## Signature

```typescript
consumeSync<U = T, C2 extends object = C>(
  fn: (
    error: ExstreamError<T> | null | undefined,
    value: T | typeof exstream.nil,
    push: (error?: unknown | null, value?: U | typeof exstream.nil | null, context?: C2) => boolean | void,
  ) => void,
): Exstream<U, C2>
```

## Related

[Extensibility](/docs/learn/extensibility/), [`consume()`](/docs/reference/consume/), [`errors()`](/docs/reference/errors/), [`flatMap()`](/docs/reference/flat-map/)
