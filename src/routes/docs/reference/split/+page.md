<svelte:head>
  <title>split() — Exstream</title>
  <meta name="description" content="Decode Exstream byte chunks and split lines safely across chunk boundaries, including encoding, final records, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/split/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `split()`

<p class="lead">Decode chunks incrementally and emit text separated by Unix or Windows line endings.</p>

## Example

```javascript
const lines = exstream(response.body).split('utf8')
```

## Parameters

<dl class="parameter-list"><div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Text decoder encoding supported by the active runtime.</p></dd></div></dl>

## Records

`split()` is `splitBy(/\r?\n/, encoding)`. Separators may span chunk boundaries, and multibyte characters are preserved by the incremental decoder. Delimiters are removed. When input ends, the remaining buffer is always emitted, including an empty string after a trailing newline and for empty decoded input.

Order and context are preserved. The operator buffers only the incomplete current line, which can grow without bound when input contains no newline. Record errors pass through without clearing that buffer.

## Errors

Unsupported encodings throw at operator creation. Invalid chunks or decoder failures become processing errors according to the runtime codec. Use parser-specific size limits when accepting untrusted records.

## Forms

```javascript
stream.split()
exstream.pipeline().split('utf8')
exstream.split('utf8', stream)
stream.through(exstream.split())
```

## Signature

```typescript
split(encoding?: string): Exstream<string, C>
```

## Related

[`splitBy()`](/docs/reference/split-by/), [`csv()`](/docs/reference/csv/), [`jsonl()`](/docs/reference/jsonl/)
