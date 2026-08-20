<svelte:head>
  <title>through() — Exstream</title>
  <meta name="description" content="Compose Exstream with pipelines, functions, streams, and Node transforms, including accepted targets and lifecycle behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/through/" />
</svelte:head>

<p class="eyebrow">API · Compose</p>

# `through()`

<p class="lead">Attach a reusable pipeline, transform function, Exstream, or Node stream to the current flow.</p>

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
      <p class="parameter-meta"><span><strong>Type</strong> <code>Pipeline | Exstream | function | Node stream | null</code></span><span><strong>Default</strong> <code>null</code></span></p>
      <p>A reusable pipeline is instantiated for this attachment. A function receives the current stream and returns its result. An Exstream target must not already be consumed. A Node duplex or transform is piped from the source and its readable side becomes the returned Exstream. <code>null</code> and <code>undefined</code> return the current stream unchanged.</p>
    </dd>
  </div>
  <div>
    <dt><code>writable</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>Applies only to Node streams. When true, treats the target as write-only and returns a non-readable Exstream that mirrors its finish, close, and error lifecycle instead of exposing a readable side. The runtime uses truthiness; TypeScript accepts a boolean.</p>
    </dd>
  </div>
</dl>

## Composition

The target defines output type, ordering, buffering, and concurrency. Backpressure and cancellation follow the connected graph; `through()` does not add a queue or neutralize the target's semantics.

```javascript
const activeOnly = (stream) => stream.filter((order) => order.active)
const active = orders.through(activeOnly)
```

Node stream targets are available only in the Node.js runtime. Invalid targets throw when attached.

For an Exstream target, `through()` connects the source to the target's root and returns that target; it must not already have a reliable consumer. A function target is called immediately with the current stream and its return value becomes the result. A reusable pipeline creates a fresh live pipeline instance for every attachment.

With a Node duplex or transform and the default `writable: false`, Exstream writes into the target and wraps its readable side. With `writable: true`, the returned Exstream is marked non-readable, starts consuming immediately, and mirrors destination `error`, `finish`, and `close` lifecycle events. Use [`pipeTo()`](/docs/reference/pipe-to/) when a completion promise and strict terminal failure contract are preferable.

The current TypeScript overloads model pipeline, Exstream, function, and null targets. Node streams are supported by the JavaScript runtime but are not yet represented by a dedicated `through()` overload; TypeScript projects may prefer `pipeTo()` or need an explicit compatibility cast.

## Errors

An unsupported target throws when attached. A transform function that throws also escapes the attachment call. Once connected, record errors, fatal failures, and cancellation follow the target graph. In write-only Node mode, destination errors are written into the returned Exstream's error channel before it ends; they reject an attached terminal consumer unless handled.

## Forms

`through()` is an instance method. Reusable pipeline definitions also expose `through()` for appending another pipeline or transform function, but not a live Exstream or Node stream:

```javascript
stream.through(reusablePipeline)
stream.through((input) => input.filter(predicate))
exstream.pipeline().through(reusablePipeline)
```

There is no standalone `exstream.through()` operator.

## Signature

```typescript
through<U>(
  target: Pipeline<T, U> | Exstream<U> | ((stream: Exstream<T, C>) => Exstream<U>),
  options?: { writable?: boolean },
): Exstream<U>

through(target?: null, options?: ThroughOptions): Exstream<T, C>
```

## Related

[Composition](/docs/learn/composition/), [`pipeTo()`](/docs/reference/pipe-to/), [`fork()`](/docs/reference/fork/), [`merge()`](/docs/reference/merge/)
