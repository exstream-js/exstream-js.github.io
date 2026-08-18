<svelte:head>
  <title>encode() — Exstream</title>
  <meta name="description" content="Encode chunked binary data as streaming base64 with Exstream, including accepted input, chunk boundaries, errors, and runtimes." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/encode/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `encode()`

<p class="lead">Convert byte-like input chunks into a continuous base64 text stream.</p>

## Signature

```typescript
encode(encoding: 'base64'): Exstream<string, C>
```

## Example

```javascript
const encoded = await exstream(byteChunks).encode('base64').toArray()
const base64 = encoded.join('')
```

## Parameters

<dl class="parameter-list"><div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'base64'</code></span><span><strong>Required</strong></span></p><p>No other output encoding is currently implemented.</p></dd></div></dl>

## Input and output

Accepted data includes strings, `Uint8Array`/Buffer, `ArrayBuffer`, arrays, and array-like byte objects supported by the runtime. The encoder carries incomplete three-byte groups across inputs, so joining output chunks produces the same base64 as encoding the concatenated bytes. It may emit empty string chunks, including its final flush; consumers should concatenate or stream them unchanged.

Order and context are preserved, buffering is constant, and existing record errors pass through.

## Errors

Unsupported encoding throws immediately. A value that cannot be converted to bytes becomes a record error naming its JavaScript type; processing can continue after an error policy handles it.

## Forms

```javascript
stream.encode('base64')
exstream.pipeline().encode('base64')
exstream.encode('base64', stream)
stream.through(exstream.encode('base64'))
```

## Related

[`decode()`](/docs/reference/decode/), [`toWebReadable()`](/docs/reference/to-web-readable/), [`toNodeReadable()`](/docs/reference/to-node-readable/)
