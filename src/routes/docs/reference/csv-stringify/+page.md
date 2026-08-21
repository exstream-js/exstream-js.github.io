<svelte:head>
  <title>csvStringify() — Exstream</title>
  <meta name="description" content="Serialize rows into CSV with complete dialect, header, quoting, encoding, limit, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/csv-stringify/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `csvStringify()`

<p class="lead">Serialize each array or object as one CSV record and emit it incrementally.</p>

## Example

```javascript
await exstream([
  { id: 1, name: 'Ada' },
  { id: 2, name: 'Linus' },
])
  .csvStringify({ header: true })
  .pipeTo(destination)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty encoding supported by the runtime. The exact label <code>'utf8'</code> emits strings; every other label, including <code>'utf-8'</code>, emits byte chunks in the selected encoding. Non-UTF-8 output encodings are Node.js-specific; browser builds reject labels their encoder cannot produce.</p></dd></div>
  <div><dt><code>separator</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>','</code></span></p><p>Any non-empty string without CR or LF. Multi-character and Unicode separators are supported.</p></dd></div>
  <div><dt><code>quote</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> one Unicode character</span><span><strong>Default</strong> <code>'"'</code></span></p><p>Wraps fields that require quoting and fields selected by <code>quoted</code>.</p></dd></div>
  <div><dt><code>escape</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> one Unicode character</span><span><strong>Default</strong> <code>'"'</code></span></p><p>Escapes quote characters inside quoted fields. When distinct from <code>quote</code>, literal escape characters are doubled.</p></dd></div>
  <div><dt><code>lineEnding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> non-empty <code>string</code></span><span><strong>Default</strong> <code>'\n'</code></span></p><p>Appended after every emitted record, including a generated header and the final row. Common values are LF and CRLF, but any non-empty string is accepted.</p></dd></div>
  <div><dt><code>header</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean | readonly PropertyKey[]</code></span><span><strong>Default</strong> <code>false</code></span></p><p>Controls column discovery and header output. See <a href="#header-modes">Header modes</a>. Values other than booleans and arrays are rejected.</p></dd></div>
  <div><dt><code>quoted</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p><p>When true, quotes every non-empty field. Fields containing separator, quote, escape, CR, or LF are quoted automatically regardless.</p></dd></div>
  <div><dt><code>quotedEmpty</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p><p>When true, serializes cells whose string representation is empty between a pair of configured quote characters, <code>""</code> with the default, instead of as a bare empty field. It does not change <code>null</code>, <code>undefined</code>, <code>false</code>, or <code>0</code>; those use normal JavaScript string coercion.</p></dd></div>
  <div><dt><code>maxColumns</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Limits discovered output columns. Crossing it emits <code>CsvStringifyError</code> with code <code>EXSTREAM_CSV_MAX_COLUMNS</code>.</p></dd></div>
  <div><dt><code>maxRecordBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Limits each encoded record including separators and its line ending. A generated header counts as a record. Crossing it uses code <code>EXSTREAM_CSV_MAX_RECORD_BYTES</code>.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

Both numeric limits are normalized with `Number()` at runtime, so any value coercing to a positive integer is accepted. TypeScript intentionally requires numbers.

## Header modes

With `header: false`, the first row determines the columns but no header record is emitted. Array columns use numeric indexes; object columns use the first object's enumerable own string keys.

With `header: true`, object input uses the first object's keys and emits them before that object. Array input is invalid because there are no names to discover.

An explicit header array both selects columns and emits a header. For object rows, its entries are property keys. For array rows, array positions correspond to input positions; nullish header entries omit those positions. String and number keys are serializable; a symbol header key cannot be converted into CSV header text and throws.

Later rows always follow the selected first-row or explicit columns. Extra object properties and array positions are ignored. A missing selected property or array position is coerced to the literal text `undefined`; `null` becomes `null`. Provide an actual empty string when an empty CSV field is required.

An empty header array selects zero columns and emits an empty header record plus an empty record for every input row. Headers are emitted only after the first input arrives: an empty source emits no header and no chunks, even with an explicit header.

## Cells and output

Input rows should be arrays or non-null objects. Cells are converted with JavaScript string coercion: nested objects normally become `[object Object]`, arrays use comma-joined text, dates use their default string form, and symbols throw. The operator does not apply locale, schema, or date formatting; normalize values before serialization.

It emits one complete record chunk at a time, including its configured line ending, preserves order, follows downstream demand, and buffers only the current record. Each emitted row chunk retains its input row context.

## Errors

Invalid options throw when attached. Invalid row/header combinations, cell coercion failures, and finite column or record-size violations throw synchronously when that record is processed; they do not enter the recoverable `errors()` channel. `CsvStringifyError` exposes `code`, one-based `record`, and, for column-limit failures, one-based `column`. Limit codes are `EXSTREAM_CSV_MAX_COLUMNS` and `EXSTREAM_CSV_MAX_RECORD_BYTES`; the general class default is `EXSTREAM_CSV_STRINGIFY`. Validate rows before serialization when processing must continue after a bad value.

Upstream record errors pass through unchanged and do not produce CSV output. Handle them before or immediately after `csvStringify()` when the terminal destination should continue.

## Forms

`csvStringify()` is available on streams and reusable pipelines:

```javascript
stream.csvStringify(options)
exstream.pipeline().csvStringify(options)
```

## Signature

```typescript
csvStringify<H extends readonly PropertyKey[] | boolean = false>(
  options?: CsvStringifyOptions<H> | null,
): Exstream<string | Uint8Array, C>

interface CsvStringifyOptions<H extends readonly PropertyKey[] | boolean = false> {
  encoding?: string
  separator?: string
  quote?: string
  escape?: string
  lineEnding?: string
  header?: H
  quoted?: boolean
  quotedEmpty?: boolean
  maxColumns?: number
  maxRecordBytes?: number
}
```

## Related

[`csv()`](/docs/reference/csv/), [`jsonlStringify()`](/docs/reference/jsonl-stringify/), [`pipeTo()`](/docs/reference/pipe-to/)
