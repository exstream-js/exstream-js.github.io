<svelte:head><title>Error API — Exstream</title><meta name="description" content="Inspect Exstream error types and provenance, including ExstreamError fields, format errors, buffer overflow, timeout, and errorInfo." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/error-api/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# Error API

<p class="lead">Keep the original error while attaching the input and stage that introduced it.</p>

## Record errors

An operational `Error` is annotated in place when possible and satisfies:

```typescript
interface ExstreamError<Input = unknown> extends Error {
  readonly exstreamError: true
  readonly exstreamInput: Input
  readonly reason?: unknown
  readonly exstreamFatal?: boolean
  readonly exstreamInfo?: { origin: ErrorOrigin; stage?: string; input?: Input }
}
```

Non-Error reasons are wrapped. `exstreamInput` identifies the record being processed. `exstreamFatal` marks graph failures. Provenance `origin` is one of `source`, `operator`, `format`, `sink`, `lifecycle`, or `unknown`.

## `errorInfo()`

```typescript
errorInfo<Input = unknown>(error: unknown): ErrorInfo<Input>
```

Returns frozen provenance without replacing the original error. Known format errors infer their stage; unknown values return `{ origin: 'unknown' }`.

## Exported classes

| Class                  | Distinct fields                                            |
| ---------------------- | ---------------------------------------------------------- |
| `BufferOverflowError`  | `code: 'EXSTREAM_BUFFER_OVERFLOW'`, `limit`                |
| `MapAsyncTimeoutError` | `code: 'EXSTREAM_MAP_ASYNC_TIMEOUT'`, `timeout`, `attempt` |
| `CsvParseError`        | `code`, `line`, `column`, `offset`, `record`               |
| `CsvStringifyError`    | `code`, `record`, optional `column`                        |
| `JsonParseError`       | `code`, `line`, `column`, `offset`, optional `record`      |
| `JsonStringifyError`   | `code`, optional `record`                                  |

Codes distinguish structural, encoding, depth, size, and output failures; the corresponding format pages list when each limit is applied.

## Related

[`errors()`](/docs/reference/errors/), [`failOnError()`](/docs/reference/fail-on-error/), [`csv()`](/docs/reference/csv/), [`json()`](/docs/reference/json/), [`mapAsync()`](/docs/reference/map-async/)
