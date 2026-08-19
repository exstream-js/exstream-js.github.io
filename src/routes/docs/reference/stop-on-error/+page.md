<svelte:head>
  <title>stopOnError() — Exstream</title>
  <meta name="description" content="Handle the first Exstream record error and stop the branch, including push outcomes, context, cancellation, and callback errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/stop-on-error/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `stopOnError()`

<p class="lead">Pass successful values until the first record error, handle it once, then stop this branch.</p>

## Example

```javascript
const partial = exstream(rows)
  .map(parseRow)
  .stopOnError((error, push) => {
    push(null, { stopped: true, reason: error.message })
  })
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(error, push, context) =&gt; void</code></span><span><strong>Required</strong></span></p><p>Called only for the first record error. Use <code>push(null, replacement)</code> to emit replacement data, <code>push(otherError)</code> to emit an error, or do not push to swallow it.</p></dd></div>
</dl>

## Behavior

Successful values before the error pass through. After `fn` returns, this branch is destroyed regardless of what it pushed; no later source values are consumed here. This is local branch termination, not automatic fatal failure, so sibling forks may continue.

The callback is synchronous. A context is supplied when it declares three parameters; if none existed, Exstream creates one from the error's original input. Pushed replacements use that context by default.

## Callback errors

The implementation does not wrap exceptions thrown by `fn`; keep the handler non-throwing. Existing fatal failures bypass it. For a handler that can process multiple errors and continue, use [`errors()`](/docs/reference/errors/).

## Forms

```javascript
stream.stopOnError(handler)
exstream.pipeline().stopOnError(handler)
exstream.stopOnError(handler, stream)
stream.through(exstream.stopOnError(handler))
```

## Signature

```typescript
stopOnError<U = T>(
  fn: (error: ExstreamError<T>, push: Push<U, C>, context: C) => void,
): Exstream<T | U, C>
```

## Related

[`errors()`](/docs/reference/errors/), [`failOnError()`](/docs/reference/fail-on-error/), [`skipErrors()`](/docs/reference/skip-errors/)
