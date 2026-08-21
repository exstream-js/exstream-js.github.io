<svelte:head>
  <title>errors() — Exstream</title>
  <meta name="description" content="Handle recoverable Exstream record errors with complete callback, push, context, and fatal-failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/errors/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `errors()`

<p class="lead">Handle recoverable record errors synchronously and optionally emit replacement values.</p>

## Example

```javascript
const recovered = pipeline.errors((error, push) => {
  if (error.code === 'MISSING_TOTAL') {
    push(null, { ...error.exstreamInput, total: 0 })
  } else {
    push(error)
  }
})
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(error, push, context) =&gt; void</code></span><span><strong>Required</strong></span></p>
      <p>Called synchronously for each recoverable error record. <code>error.exstreamInput</code> is the failing input. Declare the third parameter to receive its record context; Exstream creates it lazily when one does not already exist.</p>
    </dd>
  </div>
</dl>

## Push outcomes

- `push(null, value)` emits a successful replacement.
- `push(error)` forwards an error record.
- Returning without calling `push` drops the error.
- `push(null, value, context)` emits with an explicit context; otherwise replacements inherit the failing record's context.

The handler may call `push` more than once, but it is synchronous and does not await returned promises. Successful values and their contexts pass through unchanged without invoking `fn`.

Passing an `Error` in the value position, `push(null, error)`, keeps it as ordinary data; only the first `push` argument selects the error channel. Source `Error` values enter the error channel by default unless they were wrapped with `exstream.data(error)`.

The optional context exposes `context.input`, the branch `context.signal`, and custom upstream fields. If no context existed, requesting the third argument materializes one from `error.exstreamInput`.

## Errors

`errors()` is a recovery mechanism only for record errors. Fatal source, sink, lifecycle, and cancellation failures bypass it. Structural CSV or single-document JSON failures may reach the handler for observation, but their format operator also aborts the branch, so emitting a replacement cannot turn the partial document into a successful stream. If the handler itself throws, the exception escapes the synchronous processing turn rather than becoming a replacement or a second recoverable error; do not throw from the handler.

Every normalized error exposes `exstreamError: true` and `exstreamInput`. `exstream.errorInfo(error)` reports where it entered the pipeline, such as `{ origin: 'operator', stage: 'map' }`.

Use `failOnError()` for the opposite policy: promote the first record error to a fatal graph failure.

## Forms

`errors()` is available on streams and reusable pipelines:

```javascript
stream.errors(handler)
exstream.pipeline().errors(handler)
```

## Signature

```typescript
errors<U = T>(
  fn: (error: ExstreamError<T>, push: Push<U, C>, context: C) => void,
): Exstream<T | U, C>

type Push<U, C> = (
  error?: unknown | null,
  value?: U | Nil | null,
  context?: C,
) => boolean | void
```

## Related

[`skipErrors()`](/docs/reference/skip-errors/), [`routeErrors()`](/docs/reference/route-errors/), [errors and lifecycle](/docs/learn/errors/)
