<svelte:head>
  <title>withContext() — Exstream</title>
  <meta name="description" content="Create and enrich Exstream record contexts synchronously, including reserved fields, branch isolation, types, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/with-context/" />
</svelte:head>

<p class="eyebrow">API · Context</p>

# `withContext()`

<p class="lead">Materialize a record context and add synchronous metadata without changing the value.</p>

## Signature

```typescript
withContext(): Exstream<T, C>
withContext<A extends object | void>(
  fn: (value: T, context: CallbackContext<T, C>) => A,
): Exstream<T, MaterializedContext<C, T> & ContextAddition<A>>
```

## Example

```javascript
const traced = exstream(rows).withContext((row) => ({
  traceId: `row-${row.id}`,
  receivedAt: Date.now(),
}))

traced.map((row, context) => ({ row, traceId: context.traceId }))
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; object | undefined</code></span><span><strong>Default</strong> <code>undefined</code></span></p><p>A synchronous initializer. Its enumerable own properties are assigned to the context. Omitting it materializes context without custom fields.</p></dd></div>
</dl>

## Context rules

For a value without context, Exstream creates `{ input, signal }`. At this operator boundary an existing context is copied, so later mutations in this branch do not modify the upstream object. Enumerable string fields are copied; `input` remains the original value and `signal` is rebound to this branch.

The callback may return a plain object or `undefined`. Arrays, `null`, primitives, and an object with its own `signal` property are rejected. Other keys, including `input`, can currently be assigned; avoid overriding framework fields.

## Execution and errors

The callback is synchronous and runs once per successful value. Order, values, and pressure are unchanged. A thrown callback or invalid return becomes a contextual record error with stage `withContext`; later inputs continue when handled. Existing record errors pass through without initialization.

## Forms

```javascript
stream.withContext(initializer)
exstream.pipeline().withContext(initializer)
exstream.withContext(initializer, stream)
stream.through(exstream.withContext(initializer))
```

## Related

[`extendContext()`](/docs/reference/extend-context/), [`map()`](/docs/reference/map/), [`fork()`](/docs/reference/fork/)
