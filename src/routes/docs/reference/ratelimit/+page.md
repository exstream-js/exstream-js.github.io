<svelte:head>
  <title>ratelimit() — Exstream</title>
  <meta name="description" content="Limit Exstream throughput without dropping values, including window semantics, buffering, timing, and cancellation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/ratelimit/" />
</svelte:head>

<p class="eyebrow">API · Flow</p>

# `ratelimit()`

<p class="lead">Emit no more than a fixed number of values per time window, delaying rather than dropping excess input.</p>

## Signature

```typescript
ratelimit(num: number, milliseconds: number): Exstream<T, C>
```

## Example

```javascript
const apiCalls = exstream(requests).ratelimit(100, 60_000)
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>num</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>positive integer</code></span><span><strong>Required</strong></span></p><p>Maximum values emitted in one window.</p></dd></div>
  <div><dt><code>milliseconds</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>non-negative finite number</code></span><span><strong>Required</strong></span></p><p>Window duration. Zero effectively allows continuous delivery.</p></dd></div>
</dl>

## Window behavior

The first `num` values in a window pass immediately. The next value waits for the remainder of the window, is emitted as the first value of a new window, and only then is upstream asked for more. No successful values are dropped or reordered.

At most one excess value and one timer are retained, so memory is constant and delay becomes upstream backpressure. Existing record errors pass immediately and do not count against the rate. Branch end clears the timer.

## Errors

Invalid counts and durations throw when the operator is created. The JavaScript runtime performs numeric coercion; TypeScript accepts numbers only.

## Forms

```javascript
stream.ratelimit(100, 60_000)
exstream.pipeline().ratelimit(100, 60_000)
exstream.ratelimit(100, 60_000, stream)
stream.through(exstream.ratelimit(100, 60_000))
```

## Related

[`throttle()`](/docs/reference/throttle/), [`makeAsync()`](/docs/reference/make-async/), [`mapAsync()`](/docs/reference/map-async/)
