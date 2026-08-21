<svelte:head>
  <title>split() — Exstream</title>
  <meta name="description" content="Decode Exstream chunks and split lines or custom regular-expression-delimited text safely across chunk boundaries." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/split/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `split()`

<p class="lead">Decode chunks incrementally and emit lines or tokens separated by a custom regular expression.</p>

## Examples

```javascript
const lines = exstream(response.body).split()
const utf16Lines = exstream(chunks).split('utf16le')
const nullDelimitedRecords = exstream(chunks).split(/\0/, 'utf8')
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>encoding</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p>
      <p>When passed as the only argument, selects the decoder encoding while retaining the default <code>/\r?\n/</code> line separator.</p>
    </dd>
  </div>
  <div>
    <dt><code>separator</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>RegExp</code></span><span><strong>Optional</strong></span></p>
      <p>A custom pattern passed to <code>String.prototype.split</code>. When present, an optional second string argument selects the encoding.</p>
    </dd>
  </div>
</dl>

## Streaming behavior

Without a separator, `split()` uses `/\r?\n/` for Unix and Windows line endings. A custom separator may span chunk boundaries, and multibyte characters are preserved by the incremental decoder. Delimiters are removed; capturing groups follow native `String.prototype.split` semantics and may appear in the output.

Completed tokens are emitted immediately in order. The incomplete suffix is retained between chunks and is always emitted when input ends, including an empty string after a trailing separator and for empty decoded input. Memory is proportional to the longest segment without a separator.

Choose a separator that cannot match the empty string, because empty matches can produce surprising native split output. Order and record context are preserved. Existing record errors pass through without clearing the buffered suffix.

## Errors

Unsupported encodings throw at operator creation. Invalid chunks or decoder failures become processing errors according to the runtime codec. Use parser-specific size limits when accepting untrusted records.

## Forms

```javascript
stream.split()
stream.split('utf16le')
stream.split(/\0/, 'utf8')

exstream.pipeline().split(/\0/)
```

## Signature

```typescript
split(encoding?: string): Exstream<string, C>
split(separator: RegExp, encoding?: string): Exstream<string, C>
```

## Related

[`decode()`](/docs/reference/decode/), [`csv()`](/docs/reference/csv/), [`jsonl()`](/docs/reference/jsonl/)
