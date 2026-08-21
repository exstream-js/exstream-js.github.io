<svelte:head><title>exstream() — Exstream</title><meta name="description" content="Create an Exstream from every supported source type, including options, runtime adapters, pressure, cancellation, and errors." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/exstream/" /></svelte:head>

<p class="eyebrow">API · Create</p>

# `exstream()`

<p class="lead">Adapt an existing source into one lazy, backpressure-aware pipeline model.</p>

## Sources

Accepted sources are existing Exstreams, promises, synchronous and asynchronous iterables, Web `ReadableStream`s, Node readable streams, or no source for a manually writable stream. Existing Exstreams are returned unchanged. Source adapters preserve their natural pressure model; see [Create a source](/docs/learn/sources/) for complete examples.

## Options

<dl class="parameter-list">
  <div><dt><code>bufferLimit</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> non-negative integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum queued data/error records. The end marker does not count toward this limit.</p></dd></div>
  <div><dt><code>overflow</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'error' | 'drop-oldest' | 'drop-newest'</code></span><span><strong>Default</strong> <code>'error'</code></span></p><p>Error throws <code>BufferOverflowError</code>. Drop policies require a finite limit and update <code>dropped</code>.</p></dd></div>
  <div><dt><code>signal</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> none</span></p><p>Aborts the stream with the signal reason; an already-aborted signal creates an already-aborted stream.</p></dd></div>
  <div><dt><code>start</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'auto' | 'manual'</code></span><span><strong>Default</strong> <code>'auto'</code></span></p><p>Automatic mode activates from downstream demand. Manual mode keeps the root graph open for reliable fork registration until <code>start()</code>.</p></dd></div>
</dl>

## Errors and runtimes

Invalid source types throw synchronously. Iterator/read failures enter the record-error protocol with source provenance. Node stream support is selected by the Node entry; browser builds use Web streams and portable codecs. Source adapters acquire iterators and platform readers on demand. Use [`defer()`](/docs/reference/defer/) to postpone creation of the source object itself.

## Signature

```typescript
exstream<T, C extends object>(source: Exstream<T, C>, options?: StreamOptions | null): Exstream<T, C>
exstream<T>(source: PromiseLike<T>, options?: StreamOptions | null): Exstream<Awaited<T>>
exstream<T>(source: Iterable<T> | AsyncIterable<T>, options?: StreamOptions | null): Exstream<T>
exstream<T>(source: ReadableStream<T> | NodeReadableLike<T>, options?: StreamOptions | null): Exstream<T>
exstream<T = unknown>(source?: null, options?: StreamOptions | null): Exstream<T>

interface StreamOptions {
  bufferLimit?: number
  overflow?: 'error' | 'drop-oldest' | 'drop-newest'
  signal?: AbortSignal
  start?: 'auto' | 'manual'
}
```

## Related

[`defer()`](/docs/reference/defer/), [`fromEvent()`](/docs/reference/from-event/), [`write()`](/docs/reference/write/), [`stream state`](/docs/reference/stream-state/), [Create a source](/docs/learn/sources/)
