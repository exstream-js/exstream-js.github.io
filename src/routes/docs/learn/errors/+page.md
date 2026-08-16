<svelte:head>
  <title>Errors and lifecycle — Exstream</title>
  <meta name="description" content="Distinguish recoverable record errors from fatal graph failures and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/errors/" />
</svelte:head>

<p class="eyebrow">Learn · Failure</p>

# Errors and lifecycle

<p class="lead">A bad record and a broken pipeline are different events. Decide which failures may continue and which must stop the graph.</p>

## Record errors

An operator may produce an error associated with one input record. Handle it before the terminal boundary:

```javascript
const clean = pipeline.skipErrors((error) => error.code === 'INVALID_EMAIL')
```

Use `errors()` to emit a replacement value, `skipErrors()` to drop accepted failures, or `routeErrors()` to split data and errors into separate streams.

## Fatal failures

```javascript
await pipeline.failOnError().pipeTo(destination)
```

`failOnError()` promotes the first record error to a fatal pipeline failure. Source failures, destination failures, structural format errors, and cancellation are also visible through the terminal promise.

```javascript
try {
  await pipeline.pipeTo(destination)
} catch (error) {
  const { origin, stage } = exstream.errorInfo(error)
  console.error({ origin, stage, error })
}
```

## Cancellation

Exstream exposes an `AbortSignal` on the stream and in record context when context is materialized. Pass that signal into cancellable work such as `fetch()`.

When work is no longer useful—because a branch stopped, a terminal failed, or the caller aborted—the signal lets in-flight operations clean up early.

## Ownership

The caller awaiting the terminal operation owns the final decision: retry the whole job, report failure, abort sibling work, or resume from a checkpoint. Keep that policy outside small transformation callbacks so the graph remains understandable.
