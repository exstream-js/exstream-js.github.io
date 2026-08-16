<svelte:head>
  <title>flatMap() — Exstream</title>
  <meta name="description" content="Map Exstream values and flatten synchronous iterables with complete ordering and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/flat-map/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `flatMap()`

<p class="lead">Map each input to a value or synchronous iterable, then emit its members inline.</p>

## Signature

```typescript
flatMap<U>(
  fn: (value: T, context: CallbackContext<T, C>) => U,
): Exstream<FlatValue<U>, C>
```

## Example

```javascript
const lineItems = exstream(orders).flatMap((order) => order.items)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; U</code></span><span><strong>Required</strong></span></p>
      <p>Called synchronously for each successful input. Return any synchronous iterable to expand it. Non-iterable values and strings are emitted once. The optional context is created only when the callback declares it.</p>
    </dd>
  </div>
</dl>

## Flattening

Arrays, sets, maps, generators, and other synchronous iterables are expanded. Strings are deliberately treated as scalar values rather than sequences of characters:

```javascript
exstream([1, 2])
  .flatMap((value) => [value, value * 10])
  .valuesSync()
// [1, 10, 2, 20]

exstream(['Ada'])
  .flatMap((name) => name)
  .valuesSync()
// ['Ada']
```

The operator is equivalent to mapping and then synchronously flattening one level. It does not flatten nested iterables recursively, await promises, or merge returned Exstreams.

## Order and pressure

Inputs remain ordered, and every member of one returned iterable is emitted before the next input is processed. The iterable is consumed synchronously under downstream demand. Very large or infinite iterables can therefore monopolize the pipeline; return bounded iterables or model asynchronous sources as streams.

## Errors

A callback failure becomes a record error for its input. Existing record errors pass through. Errors thrown while consuming a returned iterable also fail processing of that record. Fatal failures abort the branch.

## Forms

`flatMap()` is available on streams and reusable pipelines, plus direct and curried standalone forms:

```javascript
stream.flatMap(fn)
exstream.pipeline().flatMap(fn)
exstream.flatMap(fn, stream)
stream.through(exstream.flatMap(fn))
```

## Related

[`map()`](/docs/reference/map/), [`merge()`](/docs/reference/merge/), [`through()`](/docs/reference/through/)
