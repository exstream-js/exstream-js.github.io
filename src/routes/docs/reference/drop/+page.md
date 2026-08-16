<svelte:head>
  <title>drop() — Exstream</title>
  <meta name="description" content="Skip the first N successful Exstream values, including count parsing, errors, context, and pressure behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/drop/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `drop()`

<p class="lead">Skip the first `n` successful values and emit the rest.</p>

## Signature

```typescript
drop(n: number): Exstream<T, C>
```

## Example

```javascript
exstream(['header', 'a', 'b']).drop(1).valuesSync()
// ['a', 'b']
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>n</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>number</code></span><span><strong>Required</strong></span></p><p>Passed to <code>slice(n, Infinity)</code>. It is parsed with <code>parseFloat</code>. Negative values emit from the beginning; fractions skip indexes lower than that fraction and therefore round up in effect.</p></dd></div>
</dl>

## Behavior

`drop()` counts successful values only. Existing record errors pass through immediately and do not advance the index. Retained values preserve order and context. The operator is synchronous, does not buffer independently, and remains lazy and backpressure-aware.

`NaN` and `Infinity` are invalid because `start` must be a number below the infinite end. Use `drop(0)` to keep every value; unlike `slice(0, Infinity)`, it delegates to that identity case.

## Forms

```javascript
stream.drop(1)
exstream.pipeline().drop(1)
exstream.drop(1, stream)
stream.through(exstream.drop(1))
```

## Related

[`slice()`](/docs/reference/slice/), [`take()`](/docs/reference/take/), [`skipErrors()`](/docs/reference/skip-errors/)
