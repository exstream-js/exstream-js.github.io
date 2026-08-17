<svelte:head>
  <title>jsonl() — Exstream</title>
  <meta name="description" content="Parse JSON Lines with complete encoding, line, reviver, depth, record-size, recovery, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/jsonl/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `jsonl()`

<p class="lead">Parse newline-delimited JSON incrementally and emit one independent value per record.</p>

## Signature

```typescript
jsonl<U = unknown>(options?: JsonlOptions | null): Exstream<U, C>

interface JsonlOptions {
  encoding?: string
  maxDepth?: number
  maxRecordBytes?: number
  skipEmptyLines?: boolean
  reviver?: (this: unknown, key: string, value: unknown) => unknown
}
```

## Example

```javascript
for await (const event of exstream(response.body).jsonl()) {
  await indexEvent(event)
}
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty encoding supported by the runtime. Encoded characters and records may span chunks.</p></dd></div>
  <div><dt><code>maxDepth</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum JSON nesting depth per record. A violating record produces code <code>EXSTREAM_JSON_MAX_DEPTH</code>.</p></dd></div>
  <div><dt><code>maxRecordBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum encoded bytes before a record delimiter, excluding that delimiter. Crossing it before a trusted boundary aborts with <code>EXSTREAM_JSONL_MAX_RECORD_BYTES</code>.</p></dd></div>
  <div><dt><code>skipEmptyLines</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p><p>Skips lines containing only spaces or tabs. With <code>false</code>, such a line becomes an <code>EXSTREAM_JSONL_EMPTY_RECORD</code> record error. Other Unicode whitespace is parsed normally and may be invalid JSON.</p></dd></div>
  <div><dt><code>reviver</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>JSON.parse</code>-compatible function</span><span><strong>Default</strong> <code>undefined</code></span></p><p>Transforms parsed properties using the same traversal and <code>this</code> semantics as <code>JSON.parse(text, reviver)</code>. It runs after incremental validation.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

Both numeric limits are normalized with `Number()` at runtime, so any value coercing to a positive integer is accepted. TypeScript intentionally requires numbers. A root object or array has depth one; each nested container increases the depth by one.

## Records

LF, CRLF, and CR delimiters are accepted and may cross chunks. The final non-empty record needs no delimiter. Empty source and trailing delimiters emit nothing. Each complete record is parsed and emitted before later input is required.

Skipped blank lines do not increment the JSONL record number. Non-skipped valid and invalid records do. Output order matches line order, and a parsed value retains the context active on the chunk that completes its record.

## Errors

Malformed JSON, an empty line when not skipped, a reviver throw, and a per-record depth violation become located record errors containing one-based `line`, `column`, and `record`, plus zero-based `offset`. General syntax uses `EXSTREAM_JSON_PARSE`, depth uses `EXSTREAM_JSON_MAX_DEPTH`, and a retained blank line uses `EXSTREAM_JSONL_EMPTY_RECORD`. Handle them with [`errors()`](/docs/reference/errors/) or `skipErrors()` to continue with later delimited records.

A decoder failure or `maxRecordBytes` violation before a record boundary is structural and aborts the branch because the next boundary cannot be trusted. Upstream record errors pass through without changing parser state.

## Forms

`jsonl()` is available on streams and reusable pipelines. The direct standalone form takes options before the stream and the curried form composes with `through()`:

```javascript
stream.jsonl(options)
exstream.pipeline().jsonl(options)
exstream.jsonl(options, stream)
stream.through(exstream.jsonl(options))
```

Pass `null` in the direct standalone form to apply defaults. Supply an output generic such as `stream.jsonl<Event>()` when the record shape is known.

The generic is a compile-time assertion only. Each line is checked as JSON, not validated against a TypeScript interface or application schema.

## Related

[`jsonlStringify()`](/docs/reference/jsonl-stringify/), [`json()`](/docs/reference/json/), [`errors()`](/docs/reference/errors/)
