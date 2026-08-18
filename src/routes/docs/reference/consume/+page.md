<svelte:head><title>consume() — Exstream</title><meta name="description" content="Build a custom asynchronous Exstream operator with push and next, including protocol records, pressure, context, errors, and lifecycle." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/consume/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `consume()`

<p class="lead">Build a custom asynchronous operator with explicit control over output and the next upstream read.</p>

## Signature

```typescript
consume<U = T, C2 extends object = C>(
  fn: (
    error: ExstreamError<T> | null | undefined,
    value: T | typeof exstream.nil,
    push: (error?: unknown | null, value?: U | typeof exstream.nil | null, context?: C2) => boolean | void,
    next: () => void,
  ) => void | Promise<void>,
): Exstream<U, C2>
```

## Protocol

Exactly one of these arrives per call: successful `value`, record `error`, or `value === exstream.nil`. Use `push(null, output)` for data, `push(error)` for an error, and `push(null, exstream.nil)` for end. Forward records explicitly; nothing is automatic inside a custom consumer.

Call `next()` exactly once when ready for another upstream record. If it is not called synchronously, Exstream pauses upstream until it is called later. Returning a promise is not itself the signal to continue; `next()` remains required. Do not call `next()` after end.

## Context and graph rules

`push()` inherits the active record context unless a replacement context is passed. The returned stream is asynchronous and becomes the source's single reliable consumer; fork first if another branch is needed. Exceptions inside custom callbacks are not automatically equivalent to `mapAsync()` policies, so catch and `push(error)` deliberately.

## Related

[`consumeSync()`](/docs/reference/consume-sync/), [async iteration](/docs/reference/async-iteration/), [`mapAsync()`](/docs/reference/map-async/)
