<svelte:head>
  <title>mapAsync() — Exstream</title>
  <meta name="description" content="Run asynchronous Exstream transforms with bounded concurrency, retries, local onFail recovery, timeouts, cancellation, and record-error propagation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/map-async/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `mapAsync()`

<p class="lead">Run promise-returning work with bounded concurrency, optional completion-order output, retries, local failure recovery, timeouts, and cancellation.</p>

## Example

```javascript
const profiles = exstream(userIds).mapAsync(fetchProfile, {
  concurrency: 8,
  ordered: false,
  retry: {
    retries: 3,
    delay: (attempt) => 250 * 2 ** (attempt - 1),
    when: (error) => error.status === 429,
  },
  timeout: 10_000,
})
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; U | PromiseLike&lt;U&gt;</code></span><span><strong>Required</strong></span></p>
      <p>Called for each successful input when a concurrency slot is available. It may return immediately or return a promise-like value. The resolved value is emitted. The same input and context are reused across retry attempts.</p>
    </dd>
  </div>
  <div>
    <dt><code>concurrency</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>positive integer | Infinity</code></span><span><strong>Default</strong> <code>1</code></span></p>
      <p>Maximum inputs owned by the operator: callbacks still running plus completed results waiting for downstream demand. Positive integers and <code>Infinity</code> are accepted; zero, negative values, fractions, and non-numeric values are rejected. A retry, its delay, and an ordered result waiting behind an earlier input retain their slots. Use a finite value at external I/O boundaries.</p>
    </dd>
  </div>
  <div>
    <dt><code>ordered</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>true</code></span></p>
      <p>With <code>true</code>, results are emitted in input order even when later tasks finish first. With <code>false</code>, each result is emitted as soon as its task completes. Only literal booleans are accepted.</p>
    </dd>
  </div>
  <div>
    <dt><code>retry</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>non-negative integer | MapAsyncRetry | null</code></span><span><strong>Default</strong> <code>null</code></span></p>
      <p>A number is the count of additional attempts after the first failure. An object configures <code>retries</code>, <code>delay</code>, and <code>when</code>. Zero and <code>null</code> disable retries. Fatal failures are never retried.</p>
    </dd>
  </div>
  <div>
    <dt><code>retry.retries</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>non-negative integer</code></span><span><strong>Default</strong> <code>0</code></span></p>
      <p>Number of additional attempts. For example, <code>retries: 2</code> allows at most three callback calls for one input.</p>
    </dd>
  </div>
  <div>
    <dt><code>retry.delay</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>non-negative milliseconds | function</code></span><span><strong>Default</strong> <code>0</code></span></p>
      <p>A fixed finite delay or a function returning one, synchronously or asynchronously. The function receives the one-based failed attempt, contextual error, input, and context. Invalid returned delays become record failures.</p>
    </dd>
  </div>
  <div>
    <dt><code>retry.when</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(error, value, context, attempt) =&gt; boolean | PromiseLike&lt;boolean&gt;</code></span><span><strong>Default</strong> retry every record failure</span></p>
      <p>Return or resolve to <code>false</code> to stop retrying that failure. The attempt number is one-based. A thrown or rejected policy function becomes the final record failure.</p>
    </dd>
  </div>
  <div>
    <dt><code>onFail</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(error, input, push, attempt, retry, context) =&gt; void | PromiseLike&lt;void&gt;</code></span><span><strong>Default</strong> <code>null</code></span></p>
      <p>Handles one failed attempt inside the current record's concurrency slot. Call <code>retry()</code> to run <code>fn</code> again with the current input, <code>retry(nextInput)</code> to run it with a replacement input, <code>push(null, output)</code> to emit a successful fallback, or <code>push(error, input)</code> to propagate a record error. The failed attempt number is one-based. The handler may be asynchronous and cannot be combined with <code>retry</code>.</p>
    </dd>
  </div>
  <div>
    <dt><code>timeout</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number | null</code></span><span><strong>Default</strong> <code>null</code></span></p>
      <p>Maximum milliseconds for each individual attempt, including <code>0</code>. A timeout is eligible for retry and produces <code>MapAsyncTimeoutError</code> with code <code>EXSTREAM_MAP_ASYNC_TIMEOUT</code>, plus <code>timeout</code> and <code>attempt</code> fields.</p>
    </dd>
  </div>
  <div>
    <dt><code>signal</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Aborts this operator. A pre-aborted signal prevents work from starting. Pass <code>context.signal</code> into cancellable I/O so cancellation and per-attempt timeouts can stop the underlying operation rather than only ignore its late result.</p>
    </dd>
  </div>
</dl>

Passing `null` or `undefined` for `options` applies every default. Other non-object values and arrays are rejected when the operator is created.

The JavaScript runtime normalizes numeric policy fields with `Number()`, so any coercible value is accepted when it produces the required integer or finite value. The TypeScript API deliberately exposes these fields as numbers; use actual numbers for portable, explicit configuration. `ordered` is strictly boolean.

## Order and pressure

`concurrency` bounds the complete operator window, not only unresolved promises. The window contains callbacks still running and completed results waiting to be accepted downstream. As soon as downstream accepts one result, that slot is released and exactly one new input may start. With a slow writer and fast callbacks, active work can therefore fall below `concurrency` while ready results occupy the rest of the window; the operator does not drain the whole window before refilling it.

Upstream demand pauses while the window is full. In ordered mode, completed results may wait in memory behind a slower earlier input; unordered mode avoids that head-of-line delay and emits completion order. Both modes use the same sliding-window refill rule.

The callback context exposes `context.input`, `context.signal`, and custom upstream fields. It is created lazily when `fn` declares its second parameter, `retry.when` declares its third, a dynamic `retry.delay` declares its fourth, or `onFail` declares its sixth. Declare those positional parameters rather than retrieving them through rest arguments when a materialized context is required. The context remains the same object across attempts and continues with the emitted result. During a timed attempt, only its `signal` is temporarily replaced with an attempt-specific signal and restored afterward.

## Retries and local recovery

Retry policy applies per input and per failed attempt. The callback receives the same value and record context each time. Delay and policy evaluation happen inside the same concurrency slot, so a large retry delay reduces available throughput.

Timeouts are also per attempt. Exstream aborts the attempt context signal when the deadline expires. JavaScript promises themselves are not cancellable, so the callback must forward that signal to `fetch`, database clients, or other cancellable APIs.

`onFail` is the programmable alternative to automatic `retry`. It is useful when recovery must await more I/O, when the next attempt needs enriched input, or when a failure should produce a fallback output:

```javascript
const processed = exstream(orders).mapAsync(processOrder, {
  concurrency: 8,
  onFail: async (error, input, push, attempt, retry, context) => {
    if (error.code === 'MISSING_CUSTOMER' && attempt < 3) {
      const customer = await recoverCustomer(input.customerId, context.signal)
      retry({ ...input, customer })
      return
    }

    push(error, input)
  },
})
```

The handler must settle at most once. Returning without calling `retry` or `push` propagates the original failure. Throwing or rejecting replaces it with the handler failure. `retry` repeats the complete `fn` callback, so any side effects inside that callback must be safe to repeat.

## Errors

A thrown callback error, rejected promise, exhausted retry policy, propagated `onFail` decision, invalid dynamic delay, or timeout becomes a contextual record error. If handled downstream, later tasks continue. If it reaches a terminal, that terminal rejects. Fatal graph failures and external cancellation abort the operator immediately and bypass retry and `onFail` policy.

Cancelling the branch stops new scheduling and ignores late completions from work that could not be cancelled.

## Forms

`mapAsync()` is available on streams and reusable pipelines:

```javascript
stream.mapAsync(fn, options)
exstream.pipeline().mapAsync(fn, options)
```

## Signature

```typescript
mapAsync<U>(
  fn: (value: T, context: C) => U | PromiseLike<U>,
  options?: MapAsyncOptions<T, C, Awaited<U>> | null,
): Exstream<Awaited<U>, C>

interface MapAsyncOptions<T, C extends object, Output = unknown> {
  concurrency?: number
  ordered?: boolean
  retry?: number | MapAsyncRetry<T, C> | null
  onFail?: (
    error: ExstreamError<T>,
    input: T,
    push: MapAsyncFailurePush<T, Output>,
    attempt: number,
    retry: MapAsyncRetryAttempt<T>,
    context: C,
  ) => void | PromiseLike<void>
  timeout?: number | null
  signal?: AbortSignal
}

interface MapAsyncFailurePush<Input, Output> {
  (error: null | undefined, value: Output): void
  (error: unknown, input?: Input): void
}

interface MapAsyncRetryAttempt<Input> {
  (): void
  (input: Input): void
}

interface MapAsyncRetry<T, C extends object> {
  retries?: number
  delay?: number | ((attempt: number, error: ExstreamError<T>, value: T, context: C) => number | PromiseLike<number>)
  when?: (error: ExstreamError<T>, value: T, context: C, attempt: number) => boolean | PromiseLike<boolean>
}
```

## Related

[`map()`](/docs/reference/map/), [`errors()`](/docs/reference/errors/), [`drain()`](/docs/reference/drain/)
