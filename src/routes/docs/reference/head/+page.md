<svelte:head>
  <title>head() — Exstream</title>
  <meta name="description" content="Emit the first successful Exstream value and stop, including empty input, errors, pressure, and forms." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/head/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `head()`

<p class="lead">Emit the first successful value and stop this branch.</p>

## Signature

```typescript
head(): Exstream<T, C>
```

## Example

```javascript
const first = await exstream(source).head().single()
```

## Behavior

`head()` is exactly `take(1)`. Empty input produces no value. It preserves the first value's context, adds no queue, and releases its upstream consumer after the first successful value. Existing record errors pass through and do not satisfy the limit; an error policy may handle them before a later value becomes the head.

Because range termination is detected on the next successful input, the source can be asked for one additional value that is not emitted. For side-effecting sources, account for that pull behavior.

## Forms

```javascript
stream.head()
exstream.pipeline().head()
exstream.head(stream)
```

## Related

[`find()`](/docs/reference/find/), [`take()`](/docs/reference/take/), [`last()`](/docs/reference/last/), [`single()`](/docs/reference/single/)
