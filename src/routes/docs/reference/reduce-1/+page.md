<svelte:head>
  <title>reduce1() — Exstream</title>
  <meta name="description" content="Reduce an Exstream using its first value as the accumulator, including empty input, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/reduce-1/" />
</svelte:head>

<p class="eyebrow">API · Aggregate</p>

# `reduce1()`

<p class="lead">Combine all successful values using the first one as the initial accumulator.</p>

## Example

```javascript
const maximum = await exstream(scores)
  .reduce1((best, score) => Math.max(best, score))
  .single()
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(accumulator, value, context) =&gt; T</code></span><span><strong>Required</strong></span></p><p>Called synchronously from the second successful value onward. The first value becomes the accumulator without invoking the callback.</p></dd></div>
</dl>

## Behavior

The final accumulator is emitted when upstream ends. The current runtime emits one `undefined` value for an empty source; avoid relying on that edge case and use `reduce(fn, initialValue)` when empty input is possible. The public TypeScript return type remains `T`.

Memory is constant apart from the accumulator and materialized contexts. Input order is preserved; existing record errors pass through and are excluded. The output has an aggregate context for successful inputs.

## Errors

A thrown reducer error becomes a contextual record error and terminates this reduction branch without a result. Returned promises are not awaited.

## Forms

```javascript
stream.reduce1(reducer)
exstream.pipeline().reduce1(reducer)
```

## Signature

```typescript
reduce1(
  fn: (accumulator: T, value: T, context: C) => T,
): Exstream<T, AggregateOutputContext<C, T>>
```

## Related

[`reduce()`](/docs/reference/reduce/), [`mapAsync()`](/docs/reference/map-async/), [`last()`](/docs/reference/last/)
