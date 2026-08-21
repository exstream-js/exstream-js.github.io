<svelte:head>
  <title>splitBy() — Exstream</title>
  <meta name="description" content="Decode and split Exstream chunks with a regular expression across boundaries, including buffering, encoding, and edge cases." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/split-by/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `splitBy()`

<p class="lead">Decode chunks incrementally and split the resulting text with a regular expression.</p>

## Example

```javascript
const records = exstream(chunks).splitBy(/\0/, 'utf8')
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>separator</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>RegExp</code></span><span><strong>Required</strong></span></p><p>Pattern passed to <code>String.prototype.split</code> for the accumulated decoded text. Capturing groups follow native split semantics and can appear in output.</p></dd></div>
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Encoding supported by the active runtime decoder.</p></dd></div>
</dl>

## Streaming

The incomplete suffix is retained between chunks, allowing separators and multibyte characters to cross boundaries. Completed tokens are emitted immediately in order. On end, the remaining suffix is emitted even when empty. Memory is proportional to the longest segment without a separator.

Choose a separator that cannot match the empty string; empty matches can create surprising native `split()` output. Context follows emitted tokens from their current input boundary. Existing record errors pass through.

## Forms

```javascript
stream.splitBy(/\0/, 'utf8')
exstream.pipeline().splitBy(/\0/)
```

## Signature

```typescript
splitBy(separator: RegExp, encoding?: string): Exstream<string, C>
```

## Related

[`split()`](/docs/reference/split/), [`decode()`](/docs/reference/decode/), [`jsonl()`](/docs/reference/jsonl/)
