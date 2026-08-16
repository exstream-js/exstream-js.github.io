<svelte:head>
  <title>errors() — Exstream</title>
  <meta name="description" content="Handle recoverable Exstream record errors with complete callback, push, context, and fatal-failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/errors/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `errors()`

<p class="lead">Handle recoverable record errors synchronously and optionally emit replacement values.</p>

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

## Errors

`errors()` handles only recoverable record errors. Fatal source, sink, lifecycle, cancellation, and structural format failures bypass the handler and abort the branch. If the handler itself throws, that failure propagates through the stream rather than being a successful recovery.

Use `failOnError()` for the opposite policy: promote the first record error to a fatal graph failure.

## Forms

`errors()` is available on streams and reusable pipelines. Its standalone form accepts the stream directly or returns a curried operator:

```javascript
stream.errors(handler)
exstream.pipeline().errors(handler)
exstream.errors(handler, stream)
stream.through(exstream.errors(handler))
```

## Related

[`skipErrors()`](/docs/reference/skip-errors/), [`routeErrors()`](/docs/reference/route-errors/), [errors and lifecycle](/docs/learn/errors/)
