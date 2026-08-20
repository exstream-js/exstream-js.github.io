<svelte:head>
  <title>toWebReadable() — Exstream</title>
  <meta name="description" content="Expose an Exstream as a Web ReadableStream, including strategy, demand, errors, cancellation, and runtime support." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-web-readable/" />
</svelte:head>

<p class="eyebrow">API · Interop</p>

# `toWebReadable()`

<p class="lead">Expose Exstream output as a pull-based Web `ReadableStream`.</p>

## Example

```javascript
const body = exstream(rows).jsonlStringify().toWebReadable()
return new Response(body, { headers: { 'content-type': 'application/x-ndjson' } })
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>signal</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> none</span></p><p>Aborts the underlying async iterator and Exstream branch.</p></dd></div>
  <div><dt><code>strategy</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>QueuingStrategy</code></span><span><strong>Default</strong> platform default</span></p><p>Passed as the native ReadableStream queuing strategy.</p></dd></div>
</dl>

## Demand and lifecycle

Each native `pull()` requests one value through Exstream's async iterator, so reader demand controls upstream work. Normal Exstream end closes the readable. A record or fatal error errors the native stream. Reader cancellation without a reason destroys the iterator cleanly; cancellation with a reason aborts the Exstream graph with that reason.

The method requires a global `ReadableStream` constructor and otherwise throws. It works in modern browsers and compatible Node runtimes.

`toWebReadable()` is an instance-only adapter.

## Signature

```typescript
interface ToWebReadableOptions {
  signal?: AbortSignal
  strategy?: QueuingStrategy<unknown>
}

toWebReadable(options?: ToWebReadableOptions | null): ReadableStream<T>
```

## Related

[async iteration](/docs/reference/async-iteration/), [`toNodeReadable()`](/docs/reference/to-node-readable/), [`pipeTo()`](/docs/reference/pipe-to/)
