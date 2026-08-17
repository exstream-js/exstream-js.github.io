<svelte:head>
  <title>asyncReduce() — Exstream</title>
  <meta name="description" content="Reduce an Exstream with an asynchronous accumulator, including strict sequencing, context, cancellation, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/async-reduce/" />
</svelte:head>

<p class="eyebrow">API · Async</p>

# `asyncReduce()`

<p class="lead">Combine all successful values into one accumulator while awaiting each reduction step.</p>

## Signature

```typescript
asyncReduce<A>(
  fn: (accumulator: A, value: T, context: C) => A | PromiseLike<A>,
  initialValue: A,
): Exstream<A, AggregateOutputContext<C, A>>
```

## Example

```javascript
const total = await exstream(ids)
  .asyncReduce(async (sum, id) => sum + (await fetchPrice(id)), 0)
  .single()
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(accumulator, value, context) =&gt; A | PromiseLike&lt;A&gt;</code></span><span><strong>Required</strong></span></p><p>Invoked once per successful input. Each result is awaited before requesting the next value.</p></dd></div>
  <div><dt><code>initialValue</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>A</code></span><span><strong>Required</strong></span></p><p>Initial accumulator and empty-source result.</p></dd></div>
</dl>

## Execution

Concurrency is always `1` and output order follows input order. The operator itself retains only the accumulator, though the aggregate context can retain input contexts. One result is emitted after upstream ends; infinite input never finishes. Backpressure is inherent because `next()` is called only after the awaited reducer settles.

There is no built-in timeout or retry policy. Use an abort-aware callback and `context.signal` for cancellation-sensitive work, or compose `mapAsync()` before a synchronous reduction when concurrency and retry controls are needed.

## Errors

A thrown or rejected reducer failure becomes a record error for the current input and terminates the reduction branch without an accumulator result. Existing record errors pass through and are excluded.

## Forms

```javascript
stream.asyncReduce(reducer, initialValue)
exstream.pipeline().asyncReduce(reducer, initialValue)
exstream.asyncReduce(reducer, initialValue, stream)
stream.through(exstream.asyncReduce(reducer, initialValue))
```

## Related

[`reduce()`](/docs/reference/reduce/), [`mapAsync()`](/docs/reference/map-async/), [`collect()`](/docs/reference/collect/)
