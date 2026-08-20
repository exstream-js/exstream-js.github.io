<svelte:head>
  <title>csv() — Exstream</title>
  <meta name="description" content="Parse chunked CSV incrementally, with complete options, output modes, limits, and error behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/csv/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `csv()`

<p class="lead">Parse strings or byte chunks incrementally. Emit each CSV record as a string array or, when headers are enabled, as an object.</p>

## Example

```javascript
const rows = exstream(csvChunks).csv({
  header: true,
  maxColumns: 100,
  maxRecordBytes: 8 * 1024 * 1024,
})

// { id: '1', total: '42.50' }
```

The parser does not convert cell values. Numbers, booleans, dates, empty fields, and whitespace all remain strings for an explicit downstream transformation.

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>encoding</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p>
      <p>Accepts any non-empty encoding label supported by the active runtime. UTF-8 is portable across Node.js and browsers. Node.js uses its <code>StringDecoder</code> encodings; browser builds use WHATWG <code>TextDecoder</code> labels. For a non-UTF-8 browser source, provide byte chunks rather than JavaScript strings.</p>
    </dd>
  </div>
  <div>
    <dt><code>separator</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>','</code></span></p>
      <p>Accepts any non-empty string that contains neither CR nor LF. Separators may contain several characters or Unicode code points, such as <code>'||'</code>, <code>'§'</code>, or <code>'💥'</code>, and may cross input chunk boundaries.</p>
    </dd>
  </div>
  <div>
    <dt><code>quote</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'"'</code></span></p>
      <p>Accepts exactly one Unicode character, including an astral character such as <code>'💥'</code>. A quoted field may contain separators, CR, LF, and escaped quote characters. Quotes may be split across chunks.</p>
    </dd>
  </div>
  <div>
    <dt><code>escape</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'"'</code></span></p>
      <p>Accepts exactly one Unicode character. With the defaults, <code>""</code> represents a literal quote inside a quoted field. When escape and quote differ, the escape character prefixes a quote and is doubled to represent itself. The parser does not require <code>separator</code>, <code>quote</code>, and <code>escape</code> to be distinct; choose a coherent dialect.</p>
    </dd>
  </div>
  <div>
    <dt><code>fastMode</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>Accepts only <code>true</code> or <code>false</code>. When enabled, quote recognition is disabled and quote characters are treated as ordinary data. Use it only when the input is guaranteed to have no quoted fields, embedded separators, or embedded line breaks.</p>
    </dd>
  </div>
  <div>
    <dt><code>skipEmptyLines</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p>
      <p>When <code>true</code>, a physically empty record is omitted. A quoted empty field, <code>""</code>, is still emitted as <code>['']</code>. Set it to <code>false</code> when an empty physical line is meaningful; that line is then emitted as <code>['']</code>.</p>
    </dd>
  </div>
  <div>
    <dt><code>header</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>false | true | readonly PropertyKey[] | function</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>Controls both header discovery and output shape. <code>false</code> emits every record as <code>string[]</code>. <code>true</code> consumes the first non-skipped record as keys. A non-empty array supplies keys without consuming an input record. A function receives the first non-skipped row, must return an array of keys, and consumes that row as the header. See <a href="#header-modes">Header modes</a> for edge cases and typing.</p>
    </dd>
  </div>
  <div>
    <dt><code>maxColumns</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p>
      <p>Limits the number of fields in each record, including empty fields. The parser accepts positive integers and <code>Infinity</code>; zero, negative numbers, fractions, and non-numeric values are rejected. Crossing the limit aborts the parser with code <code>EXSTREAM_CSV_MAX_COLUMNS</code>.</p>
    </dd>
  </div>
  <div>
    <dt><code>maxRecordBytes</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p>
      <p>Limits one encoded CSV record, excluding its record delimiter. Counting uses <code>encoding</code>, so a character may occupy several bytes. The same numeric validation as <code>maxColumns</code> applies. Crossing the limit aborts the parser with code <code>EXSTREAM_CSV_MAX_RECORD_BYTES</code>.</p>
    </dd>
  </div>
</dl>

All numeric limits are normalized with `Number()` at runtime, so any value coercing to a positive integer is accepted. TypeScript intentionally exposes them as numbers; use numeric values rather than relying on coercion.

## Header modes

### No header

The default emits every row, including the first, as an array:

```javascript
await exstream(['id,name\n1,Ada\n']).csv().toArray()
// [['id', 'name'], ['1', 'Ada']]
```

### Header row

`header: true` consumes the first non-skipped row and uses its cells as object keys:

```javascript
await exstream(['id,name\n1,Ada\n']).csv({ header: true }).toArray()
// [{ id: '1', name: 'Ada' }]
```

An empty header array has the same runtime behavior as `true`: the first input row supplies the keys.

### Explicit header

A non-empty array defines the keys before parsing begins, so the first input row remains data:

```javascript
await exstream(['1,Ada\n'])
  .csv({ header: ['id', 'name'] })
  .toArray()
// [{ id: '1', name: 'Ada' }]
```

Using a readonly tuple preserves exact keys in TypeScript:

```typescript
const header = ['id', 'name'] as const
const rows = exstream(chunks).csv({ header })
// Exstream<Record<'id' | 'name', string>, C>
```

### Header function

The function is called once with the first non-skipped row. Its returned array becomes the keys and that input row is not emitted:

```typescript
const rows = exstream(chunks).csv<readonly string[]>({
  header: (row) => row.map((cell) => cell.trim().toLowerCase()),
})
```

The explicit generic gives callback-based headers an object output type. The callback must return an actual array; a thrown error or any other return value is a structural parse failure.

### Uneven records

`csv()` does not require every record to have the same width. With object output, rows with fewer cells simply omit later keys. Rows with more cells than headers are not rejected: unmatched cells are assigned to the JavaScript key `"undefined"`, and repeated or duplicate keys overwrite earlier values. Use `maxColumns` to cap width, and validate a fixed schema downstream when equal column counts matter.

## Input and dialect

The input may contain strings, `Buffer` values in Node.js, `Uint8Array`, `ArrayBuffer`, or other typed-array views. A chunk can end anywhere: inside an encoded character, separator, escaped quote, quoted field, or CRLF pair. Empty chunks are ignored.

Records may end with LF, CRLF, or CR, and the last record does not need a trailing delimiter. Spaces are never trimmed. An empty source emits no rows.

`quote` and `escape` are validated only as single Unicode characters, so CR or LF technically satisfy the option contract and redefine how those characters are tokenized. Prefer non-newline dialect characters unless interoperability with such a format is intentional.

With quote parsing enabled, a quote may only begin at the start of a field. After its closing quote, only a separator or record delimiter is valid. Quoted fields may span physical lines; those line breaks become part of the cell string.

## Streaming and limits

`csv()` is synchronous and preserves record order. It follows downstream demand and emits complete records as soon as they are parsed; it does not collect the full input. It must retain the current incomplete field and record, so memory can still grow with one unusually large record.

The output type retains the stream context type. When source chunks carry materialized contexts, a completed row inherits the context active on the chunk that completes it; contexts from all contributing chunks are not aggregated.

Set finite `maxRecordBytes` and `maxColumns` at untrusted boundaries. They default to `Infinity` because Exstream cannot infer an application-safe limit. Cancelling or destroying the branch stops further source consumption through the normal Exstream lifecycle.

## Errors

Invalid option shapes and values throw synchronously when `csv()` is attached. Unsupported runtime encodings may fail when decoding begins.

Malformed input is a structural format failure: the parser emits a `CsvParseError` and aborts its branch because later record boundaries can no longer be trusted. The error exposes:

- `code` — one of `EXSTREAM_CSV_PARSE`, `EXSTREAM_CSV_UNTERMINATED_QUOTE`, `EXSTREAM_CSV_MAX_COLUMNS`, or `EXSTREAM_CSV_MAX_RECORD_BYTES`
- `line` and `column` — one-based physical location
- `offset` — zero-based offset in the decoded input
- `record` — one-based logical CSV record

`exstream.errorInfo(error)` also reports `{ origin: 'format', stage: 'csv' }`.

Record errors already present upstream pass through unchanged. If they are handled downstream, parsing can continue because they do not alter the CSV decoder state.

## Forms

`csv()` is available on streams and reusable pipelines. The direct standalone form takes options before the stream; the curried form is useful with `through()`:

```javascript
stream.csv(options)
exstream.pipeline().csv(options)
exstream.csv(options, stream)
stream.through(exstream.csv(options))
```

Pass `null` in the direct standalone form to apply defaults.

## Signature

```typescript
csv<H extends readonly PropertyKey[] | boolean = false>(
  options?: CsvOptions<H> | null,
): Exstream<CsvRow<H>, C>

interface CsvOptions<H extends readonly PropertyKey[] | boolean = false> {
  encoding?: string
  separator?: string
  quote?: string
  escape?: string
  fastMode?: boolean
  skipEmptyLines?: boolean
  header?: H | ((row: string[]) => readonly PropertyKey[])
  maxColumns?: number
  maxRecordBytes?: number
}

type CsvRow<H> = H extends readonly (infer K extends PropertyKey)[]
  ? Record<K, string>
  : H extends true
    ? Record<string, string>
    : string[]
```

`options` is optional. Passing `null` or `undefined` applies every default below. Other non-object values and arrays are rejected when the operator is created.

## Related

[`csvStringify()`](/docs/reference/csv-stringify/), [`json()`](/docs/reference/json/)
