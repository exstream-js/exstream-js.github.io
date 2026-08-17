<svelte:head>
  <title>take() — Exstream</title>
  <meta name="description" content="Take the first N Exstream values and stop the branch, including count validation and cancellation behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/take/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `take()`

<p class="lead">Emit at most the first `n` successful values, then stop this branch.</p>

## Signature

```typescript
take(n: number): Exstream<T, C>
```

## Example

```javascript
const preview = await exstream(largeSource).take(10).toArray()
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>n</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>number</code></span><span><strong>Required</strong></span></p><p>Exclusive upper index, passed to <code>slice(0, n)</code>. It must parse to a number greater than zero; fractions are accepted and therefore round up in effect.</p></dd></div>
</dl>

## Behavior

`take(n)` is exactly `slice(0, n)`. It preserves order and context, adds no independent buffer, and destroys its branch once the limit is reached. The implementation can consume one additional successful source value while detecting the boundary; that value is not emitted. Shared forks continue independently.

Record errors pass through and do not count toward `n`. `take(0)`, negative counts, and `NaN` are rejected because the resulting slice has no valid `start < end` range. Use an empty source when zero output is required.

## Forms

```javascript
stream.take(10)
exstream.pipeline().take(10)
exstream.take(10, stream)
stream.through(exstream.take(10))
```

## Related

[`slice()`](/docs/reference/slice/), [`head()`](/docs/reference/head/), [`stopWhen()`](/docs/reference/stop-when/)
