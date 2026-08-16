<svelte:head>
  <title>slice() — Exstream</title>
  <meta name="description" content="Select an index range from an Exstream, including bounds, defaults, early termination, pressure, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/slice/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `slice()`

<p class="lead">Emit values from a zero-based start index up to, but not including, an end index.</p>

## Signature

```typescript
slice(start: number, end?: number): Exstream<T, C>
```

## Example

```javascript
exstream(['a', 'b', 'c', 'd']).slice(1, 3).valuesSync()
// ['b', 'c']
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>start</code></dt>
    <dd><p class="parameter-meta"><span><strong>Type</strong> <code>number</code></span><span><strong>Required</strong></span></p><p>Inclusive zero-based lower bound. Values below zero effectively start at the first input.</p></dd>
  </div>
  <div>
    <dt><code>end</code></dt>
    <dd><p class="parameter-meta"><span><strong>Type</strong> <code>number</code></span><span><strong>Default</strong> <code>Infinity</code></span></p><p>Exclusive upper bound. Fractions are accepted and compared directly against integer input indexes.</p></dd>
  </div>
</dl>

## Behavior

Both bounds are parsed with `parseFloat`; the TypeScript API intentionally accepts numbers. `start` must be lower than `end`, and neither may parse to `NaN`. `slice(0, Infinity)` returns the same stream instance without adding an operator.

The operator preserves order and context and adds no queue. Reaching a finite `end` destroys this branch and releases upstream demand. It may read the value at index `end` to discover that the range has finished, but that value is not emitted. Existing record errors pass through and do not advance the successful-value index.

## Forms

```javascript
stream.slice(10, 20)
exstream.pipeline().slice(10, 20)
exstream.slice(10, 20, stream)
stream.through(exstream.slice(10, 20))
```

## Related

[`take()`](/docs/reference/take/), [`drop()`](/docs/reference/drop/), [`head()`](/docs/reference/head/)
