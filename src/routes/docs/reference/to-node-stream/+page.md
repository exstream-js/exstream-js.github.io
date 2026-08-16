<svelte:head>
  <title>toNodeStream() — Exstream</title>
  <meta name="description" content="Expose an Exstream as a Node Transform stream, including runtime support, options, pressure, errors, and lifecycle." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-node-stream/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toNodeStream()`

<p class="lead">Expose Exstream output through a Node-compatible Transform stream.</p>

## Signature

```typescript
toNodeStream(options?: object): NodeTransformLike<unknown, T>
```

## Example

```javascript
const readable = exstream(rows).jsonlStringify().toNodeStream()
readable.pipe(process.stdout)
```

## Parameters

<dl class="parameter-list"><div><dt><code>options</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> Node Transform options</span><span><strong>Default</strong> runtime defaults</span></p><p>Forwarded to the platform transform factory, including object mode and high-water-mark options.</p></dd></div></dl>

## Behavior

The returned object is both readable and writable. Exstream output is piped into it with Node backpressure: a `false` write pauses upstream until `drain`. Node stream completion and destruction are connected to the Exstream branch. Input written to the returned transform follows the runtime transform's pass-through behavior.

## Runtime and errors

Available only in the Node entry/runtime. Browser usage throws `toNodeStream() is not available in this runtime`; use `toWebReadable()` there. Record errors are emitted through the Node stream error channel. Handle `'error'` or use `pipeTo()` when a completion promise is preferable.

## Forms

```javascript
stream.toNodeStream({ objectMode: true })
exstream.toNodeStream({ objectMode: true }, stream)
exstream.toNodeStream({ objectMode: true })(stream)
```

## Related

[`toWebReadable()`](/docs/reference/to-web-readable/), [`pipe()`](/docs/reference/pipe/), [`pipeTo()`](/docs/reference/pipe-to/)
