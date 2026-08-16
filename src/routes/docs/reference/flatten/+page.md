<svelte:head>
  <title>flatten() — Exstream</title>
  <meta name="description" content="Flatten synchronous iterable Exstream values by one level, including strings, context, buffering, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/flatten/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `flatten()`

<p class="lead">Emit the members of each synchronous iterable, one level deep.</p>

## Signature

```typescript
flatten(): Exstream<FlatValue<T>, C>
```

## Example

```javascript
exstream([[1, 2], new Set([3, 4]), 5])
  .flatten()
  .valuesSync()
// [1, 2, 3, 4, 5]
```

## Flattening

Arrays, sets, maps, generators, typed arrays, and other values with `Symbol.iterator` are expanded in iteration order. Strings are deliberately treated as scalar values. Non-iterables pass through unchanged. Flattening is exactly one level; nested iterables remain nested.

```javascript
exstream([[[1]], 'ab'])
  .flatten()
  .valuesSync()
// [[1], 'ab']
```

## Pressure and context

`flatten()` consumes each iterable synchronously. It does not retain a separate collection, but a very large or infinite synchronous iterable can monopolize the current turn and can fill downstream buffers before upstream advances. Use bounded iterables and [`makeAsync()`](/docs/reference/make-async/) when yielding is necessary.

Every expanded member receives a fork of the parent record context when one exists; scalar values keep their context. Order is stable.

## Errors

Existing record errors pass through. `flatten()` does not catch exceptions thrown while obtaining or advancing an iterator; such an exception escapes the synchronous delivery call instead of becoming a contextual record error. Wrap fallible iterables before this operator when the pipeline must recover per record.

## Forms

```javascript
stream.flatten()
exstream.pipeline().flatten()
exstream.flatten(stream)
```

## Related

[`flatMap()`](/docs/reference/flat-map/), [`merge()`](/docs/reference/merge/), [`resolve()`](/docs/reference/resolve/)
