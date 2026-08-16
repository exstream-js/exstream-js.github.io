<svelte:head>
  <title>pipeTo() — Exstream</title>
  <meta name="description" content="Write Exstream to Node or Web destinations with complete close, abort, backpressure, cancellation, and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/pipe-to/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `pipeTo()`

<p class="lead">Write every successful value to a Node-style writable or Web WritableStream and await the complete transfer.</p>

## Signature

```typescript
pipeTo(
  destination: NodeWritableLike<T> | WritableStream<T>,
  options?: PipeOptions,
): Promise<void>

interface PipeOptions {
  end?: boolean
  signal?: AbortSignal
  preventAbort?: boolean
  preventClose?: boolean
}
```

## Example

```javascript
import { createWriteStream } from 'node:fs'

await pipeline.jsonlStringify().pipeTo(createWriteStream('./orders.jsonl'))
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>destination</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>NodeWritableLike&lt;T&gt; | WritableStream&lt;T&gt;</code></span><span><strong>Required</strong></span></p>
      <p>A Node-style writable exposing <code>write</code>, <code>end</code>, events, and completion, or a WHATWG <code>WritableStream</code>. Other values reject the returned promise.</p>
    </dd>
  </div>
  <div>
    <dt><code>end</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p>
      <p>Set to <code>false</code> to leave the destination open after normal source completion. Standard output streams are never closed by Exstream.</p>
    </dd>
  </div>
  <div>
    <dt><code>preventClose</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>Also leaves the destination open after successful transfer. This matches Web Streams terminology; either <code>end: false</code> or <code>preventClose: true</code> prevents closing.</p>
    </dd>
  </div>
  <div>
    <dt><code>preventAbort</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>When true, a source failure or cancellation rejects the promise but leaves the destination open instead of destroying or aborting it.</p>
    </dd>
  </div>
  <div>
    <dt><code>signal</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Cancels the transfer with the signal's reason. Unless <code>preventAbort</code> is true, the destination is aborted as well.</p>
    </dd>
  </div>
</dl>

Passing `null` or `undefined` as `options` applies all defaults. Other non-object values and arrays reject the returned promise. The three lifecycle flags use normal JavaScript truthiness; the TypeScript API exposes booleans. `signal` must have a valid `AbortSignal` shape.

## Completion

`pipeTo()` is terminal and supplies downstream demand. It resolves with `undefined` only after the source has ended and the destination has finished, closed, or completed all writes. With the destination left open, it waits for write callbacks or promises rather than for close.

Node `write()` backpressure and Web `writer.ready` propagate upstream. A hot non-pausable source still needs an explicit source buffer and overflow policy.

## Errors

Unhandled record errors, source failures, structural format failures, destination write or close failures, premature destination completion, and cancellation reject the promise. Handle recoverable record errors before `pipeTo()` when transfer should continue.

`exstream.errorInfo(error)` preserves provenance: source failures report a source origin, destination write and close failures report a sink origin, and signal cancellation reports lifecycle abort. `EXSTREAM_DESTINATION_CLOSED` identifies a destination that completes before its source.

## Forms

`pipeTo()` is terminal and cannot be added to a reusable pipeline definition. It supports instance, standalone direct, and standalone curried forms:

```javascript
await stream.pipeTo(destination, options)
await exstream.pipeTo(destination, stream)
await exstream.pipeTo(destination, options, stream)
await exstream.pipeTo(destination, options)(stream)
```

## Related

[`toAsyncIterator()`](/docs/reference/to-async-iterator/), [`drain()`](/docs/reference/drain/), [consume a pipeline](/docs/learn/consume/)
