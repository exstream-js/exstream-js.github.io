<svelte:head>
  <title>jsonlStringify() — Exstream</title>
  <meta name="description" content="Serialize JSON Lines with complete encoding, line ending, replacer, record limit, output, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/jsonl-stringify/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `jsonlStringify()`

<p class="lead">Serialize each successful value as one compact JSON record followed by a line ending.</p>

## Signature

```typescript
jsonlStringify(
  options?: JsonlStringifyOptions | null,
): Exstream<string | Uint8Array, C>

interface JsonlStringifyOptions {
  encoding?: string
  lineEnding?: string
  maxRecordBytes?: number
  replacer?:
    | readonly (number | string)[]
    | ((this: unknown, key: string, value: unknown) => unknown)
}
```

## Example

```javascript
await exstream(events)
  .jsonlStringify({ maxRecordBytes: 1024 * 1024 })
  .pipeTo(destination)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty runtime-supported encoding. UTF-8 and UTF-8 aliases emit strings; other encodings emit byte chunks.</p></dd></div>
  <div><dt><code>lineEnding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> non-empty <code>string</code></span><span><strong>Default</strong> <code>'\n'</code></span></p><p>Appended after every record, including the final one. CRLF and custom delimiters are accepted, but choose a delimiter compatible with the reader.</p></dd></div>
  <div><dt><code>maxRecordBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum encoded size of one serialized value including its line ending. Crossing it emits <code>JsonStringifyError</code> with code <code>EXSTREAM_JSONL_MAX_RECORD_BYTES</code> and a one-based record number.</p></dd></div>
  <div><dt><code>replacer</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>JSON.stringify</code>-compatible function or key array</span><span><strong>Default</strong> <code>undefined</code></span></p><p>Selects or transforms properties with standard <code>JSON.stringify(value, replacer)</code> semantics. Other values are rejected when attached.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

## Output

Each input is serialized independently and emitted as one complete chunk, in order and under downstream demand. An empty stream emits no chunks. Values follow native JSON rules: object properties with `undefined` may disappear, array entries may become `null`, while a top-level `undefined`, function, or symbol is not serializable. Cyclic objects and `BigInt` fail.

## Errors

A serialization, replacer, or size failure becomes a record error with its one-based record number. Because later JSONL records remain structurally independent, an error policy may handle it and serialization can continue with later inputs. Existing upstream record errors pass through unchanged.

## Related

[`jsonl()`](/docs/reference/jsonl/), [`jsonStringify()`](/docs/reference/json-stringify/), [`pipeTo()`](/docs/reference/pipe-to/)
