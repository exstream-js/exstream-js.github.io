<svelte:head>
  <title>csvStringify() — Exstream</title>
  <meta name="description" content="Serialize rows into CSV with complete dialect, header, quoting, encoding, limit, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/csv-stringify/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `csvStringify()`

<p class="lead">Serialize each array or object as one CSV record and emit it incrementally.</p>

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
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty encoding supported by the runtime. UTF-8 emits strings; other encodings emit byte chunks.</p></dd></div>
  <div><dt><code>separator</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>','</code></span></p><p>Any non-empty string without CR or LF. Multi-character and Unicode separators are supported.</p></dd></div>
  <div><dt><code>quote</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> one Unicode character</span><span><strong>Default</strong> <code>'"'</code></span></p><p>Wraps fields that require quoting and fields selected by <code>quoted</code>.</p></dd></div>
  <div><dt><code>escape</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> one Unicode character</span><span><strong>Default</strong> <code>'"'</code></span></p><p>Escapes quote characters inside quoted fields. When distinct from <code>quote</code>, literal escape characters are doubled.</p></dd></div>
  <div><dt><code>lineEnding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> non-empty <code>string</code></span><span><strong>Default</strong> <code>'\n'</code></span></p><p>Appended after every emitted record, including a generated header and the final row. Common values are LF and CRLF, but any non-empty string is accepted.</p></dd></div>
  <div><dt><code>header</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean | readonly PropertyKey[]</code></span><span><strong>Default</strong> <code>false</code></span></p><p>Controls column discovery and header output. See <a href="#header-modes">Header modes</a>. Values other than booleans and arrays are rejected.</p></dd></div>
  <div><dt><code>quoted</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p><p>When true, quotes every non-empty field. Fields containing separator, quote, escape, CR, or LF are quoted automatically regardless.</p></dd></div>
  <div><dt><code>quotedEmpty</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p><p>When true, serializes empty, nullish, and otherwise empty-string-coercing cells as a quoted empty field instead of a bare empty field.</p></dd></div>
  <div><dt><code>maxColumns</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Limits discovered output columns. Crossing it emits <code>CsvStringifyError</code> with code <code>EXSTREAM_CSV_MAX_COLUMNS</code>.</p></dd></div>
  <div><dt><code>maxRecordBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Limits each encoded record including separators and its line ending. A generated header counts as a record. Crossing it uses code <code>EXSTREAM_CSV_MAX_RECORD_BYTES</code>.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

## Header modes

With `header: false`, the first row determines the columns but no header record is emitted. Array columns use numeric indexes; object columns use the first object's enumerable own string keys.

With `header: true`, object input uses the first object's keys and emits them before that object. Array input is invalid because there are no names to discover.

An explicit header array both selects columns and emits a header. For object rows, its entries are property keys. For array rows, array positions correspond to input positions; nullish header entries omit those positions.

Later rows always follow the selected first-row or explicit columns. Extra object properties and array positions are ignored; missing cells serialize as empty fields.

## Cells and output

Cells are converted with JavaScript string coercion. The operator does not format dates, nested objects, or locale-specific numbers; normalize those values before serialization. It emits one complete record chunk at a time, preserves order, follows downstream demand, and buffers only the current record.

## Errors

Invalid options throw when attached. Row-shape, coercion, column, and record-size failures become located record errors with `record` and, where relevant, `column`; an error policy may handle them and allow later rows to continue. Upstream record errors pass through unchanged.

## Related

[`csv()`](/docs/reference/csv/), [`jsonlStringify()`](/docs/reference/jsonl-stringify/), [`pipeTo()`](/docs/reference/pipe-to/)
