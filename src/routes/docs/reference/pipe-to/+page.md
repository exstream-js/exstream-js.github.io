<svelte:head>
  <title>pipeTo() — Exstream</title>
  <meta name="description" content="Run an Exstream destination or write to a Node or Web writable and await complete processing." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/pipe-to/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `pipeTo()`

<p class="lead">Send a stream to a reusable Exstream destination or a platform writable and await complete processing.</p>

## Example

```javascript
import { createWriteStream } from 'node:fs'

await pipeline.jsonlStringify().pipeTo(createWriteStream('./orders.jsonl'))
```

For application-level writers, the destination can be another Exstream definition:

```javascript
const ordersApi = exstream
  .pipeline()
  .batch(200)
  .mapAsync(postOrders, { concurrency: 4, ordered: false })
  .drain()

await orders.pipeTo(ordersApi)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>destination</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>Destination&lt;T&gt; | NodeWritableLike&lt;T&gt; | WritableStream&lt;T&gt;</code></span><span><strong>Required</strong></span></p>
      <p>An Exstream destination, a Node-style writable exposing <code>write</code>, <code>end</code>, events, and completion, or a WHATWG <code>WritableStream</code>. Other values reject the returned promise.</p>
    </dd>
  </div>
  <div>
    <dt><code>end</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p>
      <p>For Node and Web writables, set to <code>false</code> to leave the destination open after normal source completion. Standard output streams are never closed by Exstream.</p>
    </dd>
  </div>
  <div>
    <dt><code>preventClose</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>For Node and Web writables, this also leaves the destination open after successful transfer. Either <code>end: false</code> or <code>preventClose: true</code> prevents closing.</p>
    </dd>
  </div>
  <div>
    <dt><code>preventAbort</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>For Node and Web writables, a true value leaves the destination open after a source failure or cancellation.</p>
    </dd>
  </div>
  <div>
    <dt><code>signal</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Cancels the transfer and its source branch with the signal's reason. For a Node or Web writable, <code>preventAbort</code> can leave the writable open.</p>
    </dd>
  </div>
</dl>

Passing `null` or `undefined` as `options` applies all defaults. Other non-object values and arrays reject the returned promise. The three lifecycle flags use normal JavaScript truthiness; the TypeScript API exposes booleans. `signal` must have a valid `AbortSignal` shape.

## Completion

`pipeTo()` is terminal and supplies downstream demand. With an Exstream destination, it resolves only after that destination's promise has settled and the source has been consumed. With a platform writable, it waits for the source to end and the writable to finish, close, or complete all accepted writes.

An Exstream destination created from `pipeline().drain()` participates in the same graph, so `batch()`, `mapAsync()`, retries, error policies, and upstream backpressure keep their normal behavior.

Node `write()` backpressure and Web `writer.ready` propagate upstream. A hot non-pausable source still needs an explicit source buffer and overflow policy.

## Errors

Unhandled record errors, source failures, structural format failures, destination failures, premature destination completion, and cancellation reject the promise. Handle recoverable record errors before `pipeTo()` when transfer should continue.

`exstream.errorInfo(error)` preserves provenance: operator and source failures keep their original information, platform write and close failures report a sink origin, custom destination failures report the `destination` sink stage, and signal cancellation reports lifecycle abort. `EXSTREAM_DESTINATION_CLOSED` identifies a platform destination that completes before its source; `EXSTREAM_DESTINATION_INCOMPLETE` identifies a custom destination that resolves without consuming its input.

`pipeTo()` is an instance-only terminal and cannot be added to a reusable pipeline definition:

```javascript
await stream.pipeTo(destination, options)
```

## Signature

```typescript
pipeTo(
  destination: Destination<T>,
  options?: { signal?: AbortSignal },
): Promise<void>

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

## Related

[`destination()`](/docs/reference/destination/), [`drain()`](/docs/reference/drain/), [async iteration](/docs/reference/async-iteration/), [consume a pipeline](/docs/learn/consume/)
