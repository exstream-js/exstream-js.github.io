<svelte:head>
  <title>skipErrors() — Exstream</title>
  <meta name="description" content="Drop all Exstream record errors or select them with a synchronous predicate, including context and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/skip-errors/" />
</svelte:head>

<p class="eyebrow">API · Errors</p>

# `skipErrors()`

<p class="lead">Drop every recoverable record error, or only errors accepted by a synchronous predicate.</p>

## Signature

```typescript
skipErrors(
  predicate?: ((error: ExstreamError<T>, input: T, context: C) => unknown) | null,
): Exstream<T, C>
```

## Example

```javascript
const valid = pipeline.skipErrors((error, input) => {
  return error.code === 'INVALID_ROW' && input.optional
})
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>predicate</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(error, input, context) =&gt; unknown | null</code></span><span><strong>Default</strong> <code>null</code></span></p>
      <p>Without a predicate, every record error is dropped. With one, a truthy result drops that error and a falsy result forwards it unchanged. The second argument is <code>error.exstreamInput</code>; the third is its lazily materialized context.</p>
    </dd>
  </div>
</dl>

## Behavior

The predicate is synchronous and is never called for successful values. Those values pass through unchanged and in order. A returned promise is truthy and is not awaited, so asynchronous selection must be modeled with another operator.

Callback arity is preserved deliberately: a unary predicate is called with only `error`; declaring a second parameter adds the failing `input`; declaring a third adds the lazily materialized `context`. This allows existing unary handlers to keep their historical argument list.

Dropping is irreversible. Use [`routeErrors()`](/docs/reference/route-errors/) when rejected records need an audit trail, retry queue, or dead-letter destination.

## Errors

If the predicate throws, its failure becomes a new contextual record error for the same input. Fatal graph failures are never suppressed. A structural CSV or single-document JSON error may pass through the predicate, but dropping it does not prevent its format operator from aborting the branch.

## Forms

`skipErrors()` is available on streams and reusable pipelines. The direct standalone form requires the predicate position; pass `null` to drop every record error:

```javascript
stream.skipErrors(predicate)
exstream.pipeline().skipErrors(predicate)
exstream.skipErrors(null, stream)
stream.through(exstream.skipErrors(predicate))
```

## Related

[`errors()`](/docs/reference/errors/), [`routeErrors()`](/docs/reference/route-errors/), [errors and lifecycle](/docs/learn/errors/)
