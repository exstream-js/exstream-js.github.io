<svelte:head>
  <title>json() — Exstream</title>
  <meta name="description" content="Parse streamed JSON with complete path, encoding, depth, value-size, streaming, and structural error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/json/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `json()`

<p class="lead">Parse one chunked JSON document and emit selected values as soon as each is complete.</p>

## Signature

```typescript
json<U = unknown>(
  options?: JsonOptions | null,
): Exstream<U, C>

interface JsonOptions {
  encoding?: string
  path?: string
  maxDepth?: number
  maxValueBytes?: number
}
```

## Example

```javascript
const events = exstream(response.body).json({
  path: '$.batches[*].events[*]',
  maxDepth: 100,
  maxValueBytes: 8 * 1024 * 1024,
})
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty encoding supported by the runtime. Byte sequences and JSON tokens may cross arbitrary input chunk boundaries.</p></dd></div>
  <div><dt><code>path</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'$'</code></span></p><p>A streamable JSONPath subset selecting values to emit: root <code>$</code>, dot properties, quoted bracket properties, non-negative array indexes, and <code>[*]</code> wildcards. See <a href="#paths">Paths</a>.</p></dd></div>
  <div><dt><code>maxDepth</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum nesting depth anywhere in the document. Crossing it aborts with code <code>EXSTREAM_JSON_MAX_DEPTH</code>.</p></dd></div>
  <div><dt><code>maxValueBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum encoded size of each selected value, not ignored document regions. Crossing it aborts with code <code>EXSTREAM_JSON_MAX_VALUE_BYTES</code>.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

## Paths

```javascript
exstream(chunks).json({ path: '$.rows[*]' })
exstream(chunks).json({ path: "$['data.items'][1]" })
exstream(chunks).json({ path: '$.groups[*].items[*]' })
```

Dot properties must be JavaScript-style identifiers. Bracket properties accept single or double quotes and JSON-like escapes. Array indexes must be safe non-negative integers without leading zeroes. Wildcards work on arrays and object property values. Recursive descent, filters, slices, unions, negative indexes, and expressions are rejected.

A missing path emits no values. The default `$` emits the complete document once.

## Streaming

Strings, Node buffers, typed arrays, array buffers, and views may be mixed as chunks. The parser preserves document order and follows downstream demand. Wildcard paths allow completed selected values to be emitted before the full document arrives; the parser retains structural state plus the selected value currently being built.

## Errors

Invalid options and unsupported paths throw when attached. Invalid JSON, incomplete input, decoder failures, depth violations, and selected-value size violations are located structural failures. They emit `JsonParseError`, annotate `{ origin: 'format', stage: 'json' }`, and abort the branch because the single document can no longer be trusted.

Upstream record errors pass through without altering parser state. Cancellation stops further parsing.

## Related

[`jsonStringify()`](/docs/reference/json-stringify/), [`jsonl()`](/docs/reference/jsonl/), [`csv()`](/docs/reference/csv/)
