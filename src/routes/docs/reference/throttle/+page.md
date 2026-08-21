<svelte:head>
  <title>throttle() — Exstream</title>
  <meta name="description" content="Drop Exstream values that arrive inside a time window, including leading behavior, timing, pressure, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/throttle/" />
</svelte:head>

<p class="eyebrow">API · Flow</p>

# `throttle()`

<p class="lead">Emit the leading value, then drop values arriving before the configured interval expires.</p>

## Example

```javascript
const snapshots = metrics.throttle(1_000)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>milliseconds</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number</code></span><span><strong>Required</strong></span></p><p>Minimum elapsed monotonic time between emitted successful values.</p></dd></div>
</dl>

## Behavior

The first value is emitted immediately. The window is measured from the last emitted value. Later values inside it are discarded; there is no trailing emission and nothing is delayed. `throttle(0)` keeps every value.

Order and context are preserved for retained values. Because dropped values are consumed immediately, this operator does not slow or backpressure a hot producer beyond normal downstream pressure on retained values. It has constant memory. Existing record errors pass through and do not reset the timer.

## Errors

Negative values, `NaN`, and `Infinity` are rejected at construction. Numeric strings are coerced at runtime but are outside the TypeScript contract.

## Forms

```javascript
stream.throttle(1_000)
exstream.pipeline().throttle(1_000)
```

## Signature

```typescript
throttle(milliseconds: number): Exstream<T, C>
```

## Related

[`rateLimit()`](/docs/reference/rate-limit/), [`makeAsync()`](/docs/reference/make-async/), [`observe()`](/docs/reference/observe/)
