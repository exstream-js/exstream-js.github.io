<svelte:head>
  <title>rateLimit() — Exstream</title>
  <meta name="description" content="Limit Exstream throughput with a local burst window, backpressure, monotonic timing, and no dropped values." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/rate-limit/" />
</svelte:head>

<p class="eyebrow">API · Flow</p>

# `rateLimit()`

<p class="lead">Emit up to a fixed number of values per local time window, delaying rather than dropping excess input.</p>

## Example

```javascript
const apiCalls = exstream(requests).rateLimit({
  limit: 100,
  interval: 60_000,
})
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>options</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>RateLimitOptions</code></span><span><strong>Required</strong></span></p>
      <p>Named rate-window settings.</p>
    </dd>
  </div>
  <div><dt><code>options.limit</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>positive integer</code></span><span><strong>Required</strong></span></p><p>Maximum successful values emitted in one window.</p></dd></div>
  <div><dt><code>options.interval</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number</code></span><span><strong>Required</strong></span></p><p>Window duration in milliseconds. Zero effectively allows continuous delivery.</p></dd></div>
</dl>

## Window behavior

The first successful value after creation or an idle interval starts a local window. Up to `limit` values in that window pass immediately. The next value waits until the monotonic window deadline, becomes the first value of the next window, and only then allows upstream to continue. Successful values are neither dropped nor reordered.

If input stays idle past the deadline, the next value starts a fresh window. A timer wake-up rechecks the deadline before releasing its waiting value, so an early timer cannot exceed the configured window.

This is a per-operator burst limiter. It does not coordinate quotas across processes or clients, and it does not guarantee a maximum inside every possible sliding interval. For a strict shared, sliding-window, or token-bucket API quota, use a shared limiter or configure this local limit conservatively.

## Pressure, errors, and cancellation

At most one excess value and one timer are retained, so operator memory is constant and the wait becomes upstream backpressure. Existing record errors pass immediately and do not consume the successful-value quota. Ending, aborting, or destroying the branch clears a pending timer.

## Errors

An invalid options object, limit, or interval throws when the operator is created. The JavaScript runtime performs numeric coercion for both numeric fields; TypeScript accepts numbers only.

## Forms

```javascript
stream.rateLimit({ limit: 100, interval: 60_000 })
exstream.pipeline().rateLimit({ limit: 100, interval: 60_000 })
```

## Signature

```typescript
interface RateLimitOptions {
  limit: number
  interval: number
}

rateLimit(options: RateLimitOptions): Exstream<T, C>
```

## Related

[`throttle()`](/docs/reference/throttle/), [`makeAsync()`](/docs/reference/make-async/), [`mapAsync()`](/docs/reference/map-async/)
