<svelte:head>
  <title>failOnError() — Exstream</title>
  <meta name="description" content="Promote the first Exstream record error to a fatal graph failure, including propagation, cancellation, and forms." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/fail-on-error/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `failOnError()`

<p class="lead">Turn the first recoverable record error reaching this operator into a fatal pipeline failure.</p>

## Example

```javascript
await exstream(rows).map(validate).failOnError().pipeTo(destination)
```

## Behavior

Successful values pass through unchanged until the first record error. That error is promoted with its original input, the branch fails, and connected work is cancelled. No later records are processed. Fatal failures already in progress bypass record-level policies as usual.

Place recoverable policies such as `errors()` or `skipErrors()` before `failOnError()` if selected failures should not terminate the graph. Context, ordering, and pressure of successful values are unchanged.

## Errors

The original error object remains the failure reason; Exstream marks the failure as fatal rather than wrapping it into a different user-visible error. Terminal consumers such as `drain()`, `toArray()`, and `pipeTo()` reject.

## Forms

```javascript
stream.failOnError()
exstream.pipeline().failOnError()
```

## Signature

```typescript
failOnError(): Exstream<T, C>
```

## Related

[`errors()`](/docs/reference/errors/), [`skipErrors()`](/docs/reference/skip-errors/), [`stopOnError()`](/docs/reference/stop-on-error/), [`routeErrors()`](/docs/reference/route-errors/)
