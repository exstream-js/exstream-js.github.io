<svelte:head>
  <title>massCatch() — Exstream</title>
  <meta name="description" content="Attach a rejection handler to every promise in an Exstream without awaiting it, including contexts and error boundaries." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/mass-catch/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `massCatch()`

<p class="lead">Call `.catch()` on every promise value and emit the resulting promises.</p>

## Signature

```typescript
massCatch<U>(
  fn: (error: unknown, context: C) => U,
): Exstream<Promise<ResolvedValue<T> | Awaited<U>>, C>
```

## Example

```javascript
const recovered = exstream(requestPromises)
  .massCatch((error) => ({ ok: false, error }))
  .resolve(8, true)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(error, context) =&gt; U</code></span><span><strong>Required</strong></span></p><p>Passed to each input promise's <code>catch()</code>. Its return value recovers that promise; throwing or rejecting leaves it rejected.</p></dd></div>
</dl>

## Behavior

This operator maps promise objects synchronously and does not await or limit their work. Fulfilled inputs pass through their fulfillment value inside a new promise. Rejected inputs invoke `fn`. Output promise order follows input order; settlement order does not.

Context is captured for the handler only when it declares a second parameter. Every input must expose a callable `.catch()`.

## Errors

Invalid inputs become `map()` record errors. Rejections are promise-level until a promise-aware operator observes them; `massCatch()` is not the same as [`errors()`](/docs/reference/errors/), which handles Exstream error records. Use [`resolve()`](/docs/reference/resolve/) after it to await outputs.

## Forms

```javascript
stream.massCatch(onRejected)
exstream.pipeline().massCatch(onRejected)
exstream.massCatch(onRejected, stream)
stream.through(exstream.massCatch(onRejected))
```

## Related

[`massThen()`](/docs/reference/mass-then/), [`resolve()`](/docs/reference/resolve/), [`errors()`](/docs/reference/errors/)
