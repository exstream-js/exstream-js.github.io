---
playground: errors
---

<svelte:head>
  <title>Errors and lifecycle — Exstream</title>
  <meta name="description" content="Distinguish recoverable record errors from fatal graph failures and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/errors/" />
</svelte:head>

<p class="eyebrow">Learn · Failure</p>

# Errors and lifecycle

<p class="lead">A bad record and a broken pipeline are different events. Decide which failures may continue and which must stop the graph.</p>

## Record errors

An operator may produce an error associated with one input record. The error retains that input, so recovery does not need to reconstruct what failed:

```javascript
const validated = pipeline.map((transaction) => {
  if (!transaction.customerId) {
    const error = new Error('Missing customer')
    error.code = 'MISSING_CUSTOMER'
    throw error
  }
  return transaction
})
```

Throwing here creates a recoverable record error; it does not automatically mean that the complete job is broken. Use `errors()` to emit a replacement, `skipErrors()` only when losing the rejected input is acceptable, or route it explicitly.

## Build a dead-letter path

`routeErrors()` creates two reliable outputs. Successful records continue through `output`; failures become `{ error, input }` records on `deadLetters`:

```javascript
const { output, deadLetters } = validated.routeErrors()

const rejected = deadLetters.map(({ error, input }) => ({
  code: error.code ?? 'UNKNOWN',
  message: error.message,
  input,
  failedAt: new Date().toISOString(),
}))

await Promise.all([output.pipeTo(processedWriter), rejected.pipeTo(deadLetterWriter)])
```

Both outputs participate in backpressure and must be consumed concurrently. A dead-letter destination is not a console dump: its records need enough information to audit, repair, replay, or deliberately discard the failed input.

## Separate retry from rejection

Retry policy belongs in the dead-letter envelope, not in an indiscriminate loop. A timeout may be transient; invalid customer data usually is not. A real feedback loop also needs explicit ownership of its lifetime:

```javascript
const failures = deadLetters.map(({ error, input }) => ({
  input,
  code: error.code,
  retryable: error.code === 'RISK_TIMEOUT',
}))

const retryable = failures.fork().filter((failure) => failure.retryable)
const rejected = failures.fork().filter((failure) => !failure.retryable)
```

The playground example uses a manual Exstream as a finite work queue. Retryable failures are written back to that input with an incremented attempt. A counter tracks logical records still in flight: retries do not change it, while a success or permanent rejection decrements it. The input ends only after the original source is exhausted and that counter reaches zero.

Keep retry attempts bounded and persist their count. Once the retry budget is exhausted, the record must become a permanent dead letter rather than circulate forever. Open the example above to watch the queue accept retries and eventually close by itself.

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

Fatal source failures, destination failures, lifecycle failures, and cancellation bypass `routeErrors()`. A DLQ is a policy for recoverable record failures, not a mechanism for pretending broken infrastructure succeeded.

## Cancellation

Exstream exposes an `AbortSignal` on the stream and in record context when context is materialized. Pass that signal into cancellable work such as `fetch()`.

When work is no longer useful—because a branch stopped, a terminal failed, or the caller aborted—the signal lets in-flight operations clean up early.

## Ownership

The caller awaiting all terminal operations owns the final decision: retry the whole job, report failure, abort sibling work, or resume from a checkpoint. Keep that policy outside small transformation callbacks so the graph—and the distinction between recovery and failure—remains understandable.
