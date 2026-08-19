<svelte:head>
  <title>extendContext() — Exstream</title>
  <meta name="description" content="Enrich Exstream record contexts asynchronously, including sequencing, return values, cancellation, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/extend-context/" />
</svelte:head>

<p class="eyebrow">API · Context</p>

# `extendContext()`

<p class="lead">Await metadata for each record and assign it to the context without changing the value.</p>

## Example

```javascript
const authorized = exstream(requests).extendContext(async (request) => ({
  permissions: await loadPermissions(request.userId),
}))
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; object | PromiseLike&lt;object | undefined&gt;</code></span><span><strong>Required</strong></span></p><p>Called once per successful value. Its resolved enumerable fields are assigned to the current context.</p></dd></div>
</dl>

## Execution

Work is strictly sequential: Exstream awaits `fn` before emitting the unchanged value and requesting another. Concurrency is therefore `1`, order is preserved, and downstream pressure propagates. There are no retry or timeout options.

Unlike `withContext()`, an existing context is extended in place instead of copied at this boundary. A missing context is materialized with `input` and a branch cancellation `signal`. The initializer must resolve to an object or `undefined`; `signal` is reserved.

## Errors and cancellation

A thrown or rejected callback and an invalid resolved value become a record error with stage `extendContext`. Processing can continue after an error policy handles it. Existing record errors pass through. Exstream stops awaiting further inputs on branch cancellation, but user work only stops promptly if it observes `context.signal`.

## Forms

```javascript
stream.extendContext(initializer)
exstream.pipeline().extendContext(initializer)
exstream.extendContext(initializer, stream)
stream.through(exstream.extendContext(initializer))
```

## Signature

```typescript
extendContext<A extends object | void | PromiseLike<object | void>>(
  fn: (value: T, context: CallbackContext<T, C>) => A,
): Exstream<T, MaterializedContext<C, T> & ContextAddition<A>>
```

## Related

[`withContext()`](/docs/reference/with-context/), [`mapAsync()`](/docs/reference/map-async/), [`asyncFilter()`](/docs/reference/async-filter/)
