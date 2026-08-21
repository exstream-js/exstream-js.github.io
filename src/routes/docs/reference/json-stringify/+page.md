<svelte:head>
  <title>jsonStringify() — Exstream</title>
  <meta name="description" content="Stream one JSON document with complete path, properties, replacer, finalizer, limit, encoding, and structural error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/json-stringify/" />
</svelte:head>

<p class="eyebrow">API · Formats</p>

# `jsonStringify()`

<p class="lead">Stream values into one JSON array, optionally nested in an object envelope with leading and final properties.</p>

## Example

```javascript
const document = exstream(records).jsonStringify({
  path: '$.data.records[*]',
  properties: { version: 1 },
  finalize: ({ count }) => ({ count }),
})

await document.pipeTo(destination)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>encoding</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'utf8'</code></span></p><p>Any non-empty encoding supported by the runtime. The exact labels <code>'utf8'</code> and <code>'utf-8'</code> emit strings; other labels emit byte chunks. Non-UTF-8 output is Node.js-specific; browser builds reject labels their encoder cannot produce.</p></dd></div>
  <div><dt><code>path</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Default</strong> <code>'$[*]'</code></span></p><p>Location of the streamed array. It must end in <code>[*]</code>. The root form emits a bare array; envelope forms may contain only property segments, such as <code>$.data.records[*]</code> or <code>$['data.items'][*]</code>.</p></dd></div>
  <div><dt><code>properties</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> record-like object</span><span><strong>Default</strong> <code>&#123;&#125;</code></span></p><p>Enumerable own string-keyed root properties serialized before the streamed array. They require an envelope path and must not collide with its first property. The runtime accepts any non-null, non-array object; TypeScript exposes <code>Record&lt;string, unknown&gt;</code>.</p></dd></div>
  <div><dt><code>maxValueBytes</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> positive integer or <code>Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Maximum encoded size of each streamed array item, excluding commas and envelope text. Crossing it raises code <code>EXSTREAM_JSON_MAX_VALUE_BYTES</code>.</p></dd></div>
  <div><dt><code>replacer</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>JSON.stringify</code>-compatible function or key array</span><span><strong>Default</strong> <code>undefined</code></span></p><p>Applied to array items, leading properties, and final properties with native JSON serialization semantics.</p></dd></div>
  <div><dt><code>finalize</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(stats) =&gt; object | PromiseLike&lt;object&gt;</code></span><span><strong>Default</strong> <code>undefined</code></span></p><p>Runs after the source ends and may return root properties synchronously or asynchronously. It requires an envelope path. Returned keys must not collide with <code>properties</code> or the path's first property.</p></dd></div>
</dl>

Passing `null` or `undefined` applies all defaults. Other non-object values and arrays are rejected.

`maxValueBytes` is normalized with `Number()` at runtime, so any value coercing to a positive integer is accepted. TypeScript intentionally requires a number.

## Envelope

The default produces `[value,value]`. An envelope path creates nested objects around the streamed array. `properties` appear at the root before the path; `finalize()` properties appear at the root after it:

```json
{ "version": 1, "data": { "records": [{ "id": 1 }, { "id": 2 }] }, "count": 2 }
```

`count` is the number of successfully serialized array values. `bytesWritten` is the encoded byte count emitted before final properties and closing delimiters. `signal` aborts when finalization work should stop. `finalize()` must resolve to a non-null, non-array object; only its enumerable own string keys are appended.

## Streaming

The opening envelope and each successful item are emitted incrementally in input order. An empty source still emits a valid empty array and envelope. Final output waits for `finalize()` when provided.

The first emitted chunk contains the opening envelope and first item; later item chunks begin with a comma, and the final chunk closes the array and envelope. With empty input, the opening and closing pieces are still emitted. Consumers must concatenate chunks in order to obtain the document.

The complete document is one structural unit. Unlike JSONL, a failed item cannot be skipped after earlier bytes have been emitted without producing invalid JSON.

## Errors

Invalid options and failures while serializing leading `properties` throw when the operator is attached. Unsupported streamed values, cyclic structures, replacer failures, item-size violations, invalid finalizer results, rejected finalizers, and final-property collisions are structural `JsonStringifyError` failures during consumption. They annotate the format stage and abort the branch so a truncated document is never reported as successful.

General failures use `EXSTREAM_JSON_STRINGIFY`; an oversized item uses `EXSTREAM_JSON_MAX_VALUE_BYTES` and includes its one-based `record`. Array items and individual leading/final property values must each serialize to a defined JSON value; unlike properties inside an ordinary object passed to `JSON.stringify`, an `undefined` root property is rejected rather than silently omitted.

Upstream record errors pass through without adding an array item. Handle them before or immediately after `jsonStringify()` when the document and its terminal destination should continue.

## Forms

`jsonStringify()` is available on streams and reusable pipelines:

```javascript
stream.jsonStringify(options)
exstream.pipeline().jsonStringify(options)
```

The `FinalProperties` generic describes the object returned by `finalize()`. It improves compile-time checking of the finalizer only; it does not add runtime schema validation.

## Signature

```typescript
jsonStringify<FinalProperties extends object = Record<string, unknown>>(
  options?: JsonStringifyOptions<FinalProperties> | null,
): Exstream<string | Uint8Array, C>

interface JsonStringifyOptions<FinalProperties extends object> {
  encoding?: string
  path?: string
  properties?: Record<string, unknown>
  maxValueBytes?: number
  replacer?:
    | readonly (number | string)[]
    | ((this: unknown, key: string, value: unknown) => unknown)
  finalize?: (stats: JsonStringifyStats) => FinalProperties | PromiseLike<FinalProperties>
}

interface JsonStringifyStats {
  readonly count: number
  readonly bytesWritten: number
  readonly signal: AbortSignal
}
```

## Related

[`json()`](/docs/reference/json/), [`jsonlStringify()`](/docs/reference/jsonl-stringify/), [`pipeTo()`](/docs/reference/pipe-to/)
