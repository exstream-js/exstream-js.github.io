<svelte:head>
  <title>decode() — Exstream</title>
  <meta name="description" content="Decode chunked base64 text into bytes with Exstream, including incomplete groups, output types, errors, and runtimes." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/decode/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `decode()`

<p class="lead">Decode a continuous base64 text stream into binary chunks.</p>

## Signature

```typescript
decode(encoding: 'base64'): Exstream<Uint8Array, C>
```

## Example

```javascript
const bytes = exstream(base64Chunks).decode('base64')
```

## Parameters

<dl class="parameter-list"><div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Allowed</strong> <code>'base64'</code></span><span><strong>Required</strong></span></p><p>No other input encoding is currently implemented.</p></dd></div></dl>

## Streaming

Text fragments are concatenated until a complete four-character base64 group is available. Complete groups are decoded immediately; any remaining suffix is decoded when input ends. Chunk boundaries can occur anywhere in the base64 text.

Output is `Uint8Array`-compatible and is a Buffer in Node where the runtime uses Buffer. Empty decoded chunks are not emitted. Order and context are preserved and buffering is limited to an incomplete group plus the current input.

## Errors

Unsupported encoding throws at creation. Base64 validation follows the active platform decoder and may be permissive about whitespace or malformed characters; validate separately when canonical base64 is a requirement. Existing record errors pass through.

## Forms

```javascript
stream.decode('base64')
exstream.pipeline().decode('base64')
exstream.decode('base64', stream)
stream.through(exstream.decode('base64'))
```

## Related

[`encode()`](/docs/reference/encode/), [`split()`](/docs/reference/split/), [`toNodeReadable()`](/docs/reference/to-node-readable/)
