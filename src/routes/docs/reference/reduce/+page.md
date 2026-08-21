<svelte:head>
  <title>reduce() — Exstream</title>
  <meta name="description" content="Reduce an Exstream to one value with an initial accumulator, including context aggregation, memory, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/reduce/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `reduce()`

<p class="lead">Combine all successful values into one accumulator, starting from an explicit initial value.</p>

## Example

```javascript
const total = await exstream(orders)
  .reduce((sum, order) => sum + order.total, 0)
  .single()
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(accumulator, value, context) =&gt; A</code></span><span><strong>Required</strong></span></p><p>Synchronous reducer called in input order for every successful value. Its return value becomes the next accumulator.</p></dd></div>
  <div><dt><code>initialValue</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>A</code></span><span><strong>Required</strong></span></p><p>The first accumulator and the result emitted for an empty source.</p></dd></div>
</dl>

## Behavior

One value is emitted only after upstream ends. The accumulator is retained in memory; `reduce()` does not retain every input unless your accumulator does. It consumes sequentially, preserves input order, and propagates pressure. Infinite input does not finish.

The result receives an aggregate context containing materialized input contexts in order when they exist. Existing record errors pass through and are excluded from the reduction; handling them allows reduction to continue.

## Errors

If `fn` throws, Exstream emits a record error associated with the current input and destroys this reduction branch; no accumulator result follows. Promise results are not awaited. Run independent asynchronous work with [`mapAsync()`](/docs/reference/map-async/) before reducing. When each asynchronous step depends on the previous accumulator, consume the stream with `for await` and update that state explicitly.

## Forms

The argument order is `fn, initialValue`, matching `Array.prototype.reduce()`:

```javascript
stream.reduce(reducer, initialValue)
exstream.pipeline().reduce(reducer, initialValue)
```

## Signature

```typescript
reduce<A>(
  fn: (accumulator: A, value: T, context: C) => A,
  initialValue: A,
): Exstream<A, AggregateOutputContext<C, A>>
```

## Related

[`reduce1()`](/docs/reference/reduce-1/), [`mapAsync()`](/docs/reference/map-async/), [`collect()`](/docs/reference/collect/)
