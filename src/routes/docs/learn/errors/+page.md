---
playground: errors
---

<svelte:head>
  <title>Errors and lifecycle — Exstream</title>
  <meta name="description" content="Learn how Exstream propagates record errors, retries asynchronous work, routes dead letters, and turns unhandled failures into failed runs." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/errors/" />
</svelte:head>

<p class="eyebrow">Learn · Failure</p>

# Errors and lifecycle

<p class="lead">Handle a failure while it still belongs to one record. If it remains unhandled, the run fails.</p>

## The whole model in three rules

1. A failure caused while processing one input becomes a **record error**. It travels downstream with that input and the rest of the stream can still continue.
2. A record error is handled only when a policy replaces it, drops it, or routes it elsewhere. If it reaches a terminal such as `toArray()`, `drain()`, or `pipeTo()`, the terminal rejects and aborts its consumer branch.
3. A failure from which the graph cannot continue safely is **fatal** immediately. Configured fatal source failures, destination failures, cancellation, and errors explicitly promoted with `failOnError()` are examples. Fatal failures bypass record-error handlers.

This is the useful distinction: **handled failures continue; unhandled failures fail the run**. “Record” and “fatal” describe where Exstream still has a recovery choice, not whether the original exception looked serious.

In other words, an unhandled record error is promoted to a run-level failure at the terminal. It has become fatal to that run even though it began as a recoverable record error.

## Record errors work like rejected promises

For one value, a Promise chain skips successful callbacks after a rejection until it reaches a `catch()`:

```javascript
await Promise.resolve(record)
  .then(validate)
  .then(normalize)
  .then(calculatePrice)
  .catch(handleFailure)
```

An Exstream pipeline follows the same idea across many records:

```javascript
await exstream(records)
  .map(validate)
  .map(normalize)
  .map(calculatePrice)
  .errors((error, push) => {
    handleFailure(error, error.exstreamInput)
    // No push: this failed record is handled and dropped.
  })
  .toArray()
```

If `normalize()` throws for one record, `calculatePrice()` is not called for that record. The error passes through it and is intercepted by the first downstream `errors()`. Successful records still call every operator normally.

The rejected input is available as `error.exstreamInput`:

```javascript
const validated = exstream(transactions).map((transaction) => {
  if (!transaction.customerId) {
    const error = new Error('Missing customer')
    error.code = 'MISSING_CUSTOMER'
    throw error
  }

  return transaction
})

validated.errors((error) => {
  console.log(error.exstreamInput) // the transaction rejected by map()
})
```

Exstream also keeps the record context and annotates errors with diagnostic `origin` and `stage` metadata. That metadata tells you where the error came from; it does not decide whether the application should recover.

## Handle errors where the policy is known

An `errors()` handler has three choices:

```javascript
const recovered = pipeline.errors((error, push) => {
  if (error.code === 'MISSING_TOTAL') {
    // Replace the failed record. Processing resumes after this errors().
    push(null, { ...error.exstreamInput, total: 0 })
  } else if (error.code === 'OPTIONAL_ROW') {
    // Return without pushing: handle and drop this record.
    return
  } else {
    // Not handled here. Keep searching downstream for another policy.
    push(error)
  }
})
```

You can place more than one boundary in a pipeline:

```javascript
const output = exstream(records)
  .map(parseRecord)
  .errors(handleParseError)
  .map(applyBusinessRules)
  .errors(handleBusinessError)
```

The first `errors()` sees errors produced before it. If it forwards one with `push(error)`, that error can reach the second handler. Errors produced by `applyBusinessRules()` begin downstream of the first handler and therefore reach only the second.

`errors()` does not travel backwards. A replacement emitted with `push(null, value)` continues after the handler; it does not re-run `parseRecord()` or any earlier operator. This is deliberate: replaying a generic stream segment would be ambiguous for stateful operators such as `uniq()`, `filter()`, `batch()`, and side effects.

## Promise rejections in `mapAsync()`

`mapAsync()` turns both a synchronous throw and a rejected promise into a record error for the current input:

```javascript
const profiles = exstream(users).mapAsync(async (user, context) => {
  const response = await fetch(`/profiles/${user.id}`, {
    signal: context.signal,
  })

  if (!response.ok) {
    const error = new Error(`Profile request failed: ${response.status}`)
    error.status = response.status
    throw error
  }

  return { ...user, profile: await response.json() }
})
```

If the returned promise rejects, the error continues to the next `errors()` or `routeErrors()` exactly like an exception from `map()`. If nobody handles it, the terminal promise rejects.

Returning or resolving to an `Error` object is successful data. Throw or reject to use the error channel.

## Retry asynchronous work inside `mapAsync()`

Use the built-in `retry` policy when another attempt should run the same callback with the same input:

```javascript
const profiles = exstream(userIds).mapAsync(loadProfile, {
  concurrency: 8,
  timeout: 10_000,
  retry: {
    retries: 2,
    when: (error) => error.status === 429 || error.status >= 500,
    delay: (attempt) => 250 * 2 ** (attempt - 1),
  },
})
```

`retries: 2` means one initial call plus at most two additional calls.

Use `onFail` when recovery itself is asynchronous or the next attempt needs a different input. The callback can include an entire per-record workflow, so `retry()` repeats all of it without rebuilding a stream:

```javascript
async function processOrder(order, context) {
  const customer = order.customer ?? (await loadCustomer(order.customerId, context.signal))
  const quote = await calculateQuote(order, customer, context.signal)
  const reservation = await reserveStock(order, quote, context.signal)

  return { order, customer, quote, reservation }
}

const attempted = exstream(orders).mapAsync(processOrder, {
  concurrency: 8,
  onFail: async (error, input, push, attempt, retry, context) => {
    if (error.code === 'MISSING_CUSTOMER' && attempt < 3) {
      const customer = await recoverCustomer(input.customerId, context.signal)

      // Re-run processOrder() from its beginning with the enriched input.
      retry({ ...input, customer })
      return
    }

    // Leave the error on the record-error channel.
    push(error, input)
  },
})
```

`attempt` is one-based. `retry()` uses the current input; `retry(nextInput)` uses a replacement input. The same record context and concurrency slot are retained while `onFail` awaits and while another attempt runs.

The handler must make at most one decision:

- `retry()` or `retry(nextInput)` runs `processOrder()` again;
- `push(null, output)` recovers immediately with a final output;
- `push(error, input)` propagates a record error downstream;
- returning without a decision propagates the original error;
- throwing or rejecting from `onFail` produces a record error for the current input.

`onFail` and the automatic `retry` option are alternative policies and cannot be combined. Without `onFail`, `mapAsync()` keeps its existing behavior: the callback runs once unless `retry` is configured, and its final failure becomes a record error. Fatal failures and cancellation bypass both policies.

Retries replay the callback, including its side effects. Make the workflow idempotent, pass idempotency keys to external systems, or split non-repeatable work into a later stage.

## Record-level writes versus destination failures

If one database write can fail independently for one record, put that write in `mapAsync()`. Its rejection then has an input and can use `onFail`, `errors()`, or a dead-letter queue:

```javascript
const written = exstream(rows).mapAsync(
  async (row, context) => {
    await database.insert(row, { signal: context.signal })
    return row
  },
  {
    concurrency: 16,
    onFail(error, row, push, attempt, retry) {
      if (error.code === 'DEADLOCK' && attempt < 3) retry()
      else push(error, row)
    },
  },
)
```

A destination passed to `pipeTo()` owns the complete sink lifecycle. If opening, writing, closing, or cleaning up that destination fails, `pipeTo()` rejects and the branch is cancelled. Exstream cannot safely assume that such a failure belongs only to one record. Use a per-record `mapAsync()` boundary when the client and application really provide that guarantee.

The same boundary applies to sources. If a required database connection cannot open, there is no next record to process. A source adapter may expose that failure for observation, but handling the error cannot restart the exhausted source. Let the terminal reject and retry resource acquisition or the complete job at the boundary that owns it.

## Route remaining errors to a dead-letter queue

A dead-letter queue is separate from local retry. Place `routeErrors()` wherever all remaining record failures should become data:

```javascript
const { output, deadLetters } = attempted.routeErrors()

const rejected = deadLetters.map(({ error, input }) => ({
  code: error.code ?? 'UNKNOWN',
  message: error.message,
  input,
  failedAt: new Date().toISOString(),
}))

await Promise.all([output.pipeTo(processedWriter), rejected.pipeTo(deadLetterWriter)])
```

`routeErrors()` handles record errors by turning them into `{ error, input }` values. Consume both reliable branches concurrently; otherwise the unconsumed branch can stop the source through backpressure.

If there is no downstream `errors()`, `skipErrors()`, `stopOnError()`, or `routeErrors()`, a record error eventually reaches the terminal. At that point the run fails. Fatal graph failures bypass the dead-letter route and reject the terminal directly.

## The other policies are variations of the same decision

| Policy          | Decision                                                                |
| --------------- | ----------------------------------------------------------------------- |
| `errors()`      | Replace, drop, or forward each matching record error                    |
| `skipErrors()`  | Explicitly drop all record errors or those selected by a predicate      |
| `routeErrors()` | Turn remaining record errors into dead-letter values                    |
| `stopOnError()` | Handle the first record error, then end this branch with partial output |
| `failOnError()` | Promote the first record error to a fatal connected-graph failure       |

Use `skipErrors()` only when losing the record is an explicit policy. Use `failOnError()` when one invalid record invalidates the complete job.

## Await the lifecycle

Pipelines are lazy. A terminal starts demand and returns the authoritative completion promise:

```javascript
try {
  await pipeline.pipeTo(destination)
  // Source, processing, and destination all completed.
} catch (error) {
  const { origin, stage, input } = exstream.errorInfo(error)
  console.error({ origin, stage, input, error })
}
```

Normal completion and fully handled record errors resolve the terminal. An unhandled record error, a fatal source or destination failure, and external cancellation reject it. Pass `context.signal` into cancellable asynchronous APIs so work can stop promptly.

Do not treat the `end` event as proof of success: it is emitted for every terminal state, including abort. Await `toArray()`, `single()`, `drain()`, or `pipeTo()` and handle the returned promise.

For exact contracts, see [`mapAsync()`](/docs/reference/map-async/), [`errors()`](/docs/reference/errors/), [`routeErrors()`](/docs/reference/route-errors/), [`skipErrors()`](/docs/reference/skip-errors/), [`stopOnError()`](/docs/reference/stop-on-error/), [`failOnError()`](/docs/reference/fail-on-error/), and the [Error API](/docs/reference/error-api/).
