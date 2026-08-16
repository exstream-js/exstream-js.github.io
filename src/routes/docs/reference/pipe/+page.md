<svelte:head>
  <title>pipe() — Exstream</title>
  <meta name="description" content="Pipe Exstream values to Node, Web, Exstream, or pipeline destinations, including return types, pressure, completion, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/pipe/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `pipe()`

<p class="lead">Connect an Exstream to another pipeline or a platform writable using destination-native return semantics.</p>

## Signature

```typescript
pipe<D extends NodeWritableLike<T>>(destination: D, options?: PipeOptions): D
pipe(destination: WritableStream<T>, options?: PipeOptions): Promise<WritableStream<T>>
pipe<U, C2 extends object>(
  destination: Exstream<U, C2> | Pipeline<T, U, C2>,
  options?: PipeOptions,
): Exstream<U, C2>
```

## Example

```javascript
source.pipe(nodeWritable) // returns nodeWritable immediately
await source.pipe(webWritable) // resolves with webWritable
const transformed = source.pipe(exstream.pipeline().map(normalize))
```

## Parameters

`destination` may be a Node-style writable, Web `WritableStream`, Exstream, or reusable pipeline. For a Node destination, `pipe()` uses `end` (default `true`, except standard output); the other `PipeOptions` fields are not applied by this legacy-returning path. For a Web destination, `end`, `signal`, `preventAbort`, and `preventClose` have the same meanings as [`pipeTo()`](/docs/reference/pipe-to/). Exstream and pipeline destinations ignore sink options and compose through `through()`.

## Return and completion

The return type depends on the destination. Node piping follows Node convention and returns the destination before completion. Web piping returns a promise resolving to the writable. Exstream and pipeline destinations are composition and return the connected output stream.

Both Node and Web transfers honor destination backpressure. Record errors are forwarded to the destination error channel. For one consistent `Promise<void>` that rejects on all unhandled failures, use `pipeTo()`.

## Forms

`pipe()` is an instance method; the standalone terminal equivalent is `pipeTo()`:

```javascript
stream.pipe(destination, options)
```

## Related

[`pipeTo()`](/docs/reference/pipe-to/), [`through()`](/docs/reference/through/), [`toNodeStream()`](/docs/reference/to-node-stream/), [`toWebReadable()`](/docs/reference/to-web-readable/)
