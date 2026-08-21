<svelte:head>
  <title>through() — Exstream</title>
  <meta name="description" content="Compose an Exstream with a reusable pipeline, transform function, or Node transform." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/through/" />
</svelte:head>

<p class="eyebrow">API · Compose</p>

# `through()`

<p class="lead">Attach a reusable transformation to the current stream.</p>

## Example

```javascript
const normalizeOrder = exstream
  .pipeline()
  .map((order) => ({ ...order, total: Number(order.total) }))
  .filter((order) => order.total > 0)

const normalized = exstream(rows).through(normalizeOrder)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>target</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>Pipeline | function | Node Transform</code></span></p>
      <p>A reusable pipeline is instantiated for this attachment. A function receives the current Exstream and returns the transformed Exstream. In Node.js, a native duplex or transform is also accepted and its readable side becomes the returned Exstream.</p>
    </dd>
  </div>
</dl>

## Composition

A function can package a small transformation without changing its behavior:

```javascript
const activeOnly = (stream) => stream.filter((order) => order.active)
const active = orders.through(activeOnly)
```

A pipeline is a reusable definition. Every attachment creates an independent operator chain, so buffers and other operator state are not shared:

```javascript
const normalize = exstream.pipeline().map(normalizeOrder)

const apiOrders = exstream(apiRows).through(normalize)
const fileOrders = exstream(csvRows).through(normalize)
```

An empty pipeline is an explicit identity target. Exstream recognizes it before instantiation and returns the current stream without adding a node, queue, or per-record work. This makes conditional composition cheap:

```javascript
const transform = shouldNormalize ? exstream.pipeline().map(normalizeOrder) : exstream.pipeline()

const orders = source.through(transform)
```

In Node.js, pass a duplex or transform when data must continue through its readable side:

```javascript
const decompressed = exstream(compressedInput).through(zlib.createGunzip())
```

Use [`pipeTo()`](/docs/reference/pipe-to/) for a write-only terminal destination:

```javascript
await orders.pipeTo(createWriteStream('orders.jsonl'))
```

The target determines output type, ordering, buffering, and concurrency. Backpressure, errors, and cancellation follow the connected graph; `through()` does not add its own queue or error boundary.

## Errors

Passing `null`, `undefined`, a live Exstream, a Node writable-only stream, or a second options argument throws when attached. A transform function that throws also escapes the attachment call. Once connected, record errors and fatal failures follow the resulting graph.

## Forms

Reusable pipeline definitions also expose `through()` for appending another pipeline or transform function:

```javascript
stream.through(reusablePipeline)
stream.through((input) => input.filter(predicate))
exstream.pipeline().through(reusablePipeline)
```

## Signature

```typescript
through<U>(
  target: Pipeline<T, U> | ((stream: Exstream<T, C>) => Exstream<U>),
): Exstream<U>

through<U>(target: NodeTransformLike<T, U>): Exstream<U, C>
```

## Related

[Composition](/docs/learn/composition/), [`pipeline()`](/docs/reference/pipeline/), [`pipeTo()`](/docs/reference/pipe-to/), [`toNodeTransform()`](/docs/reference/to-node-transform/)
