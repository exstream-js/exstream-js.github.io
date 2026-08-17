<svelte:head>
  <title>stopWhen() — Exstream</title>
  <meta name="description" content="Emit Exstream values through the first matching stop condition, with inclusive semantics, cancellation, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/stop-when/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `stopWhen()`

<p class="lead">Emit values until a synchronous condition matches, including the value that matched.</p>

## Signature

```typescript
stopWhen(fn: (value: T, context: C) => unknown): Exstream<T, C>
```

## Example

```javascript
await exstream([1, 2, 3, 4])
  .stopWhen((value) => value === 3)
  .toArray()
// [1, 2, 3]
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown</code></span><span><strong>Required</strong></span></p>
      <p>Runs synchronously after each successful value has been emitted. A truthy result stops this branch.</p>
    </dd>
  </div>
</dl>

## Behavior

The matching value is always emitted before the branch is destroyed. If the predicate never matches, all values pass through. `stopWhen()` preserves order and context, adds no independent queue, and propagates downstream pressure.

Destroying this branch releases its upstream consumer. Shared sources continue for other forks; an otherwise unneeded source can stop. This is branch termination, not a fatal pipeline failure.

## Errors

Existing record errors pass through and do not call `fn`. If `fn` throws, the exception escapes the synchronous consumer boundary; handle fallible logic before this operator. Promises are not awaited and are truthy, so an async predicate stops on the first value.

## Forms

```javascript
stream.stopWhen(predicate)
exstream.pipeline().stopWhen(predicate)
exstream.stopWhen(predicate, stream)
stream.through(exstream.stopWhen(predicate))
```

## Related

[`take()`](/docs/reference/take/), [`find()`](/docs/reference/find/), [`filter()`](/docs/reference/filter/)
