<svelte:head>
  <title>last() — Exstream</title>
  <meta name="description" content="Emit only the final successful Exstream value, including buffering, completion, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/last/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `last()`

<p class="lead">Consume the complete source and emit its final successful value.</p>

## Signature

```typescript
last(): Exstream<T, C>
```

## Example

```javascript
const latest = await exstream(records).last().single()
```

## Behavior

`last()` retains one successful value and its context, replacing them as input arrives. It emits only when upstream ends. Empty input emits nothing. Order is therefore meaningful but output cannot begin early, and infinite sources never produce a result unless they are stopped.

Memory is constant apart from the retained value. Downstream pressure propagates normally while input is consumed. Existing record errors pass through immediately and do not replace the retained candidate; a handled error allows later values to continue.

## Forms

```javascript
stream.last()
exstream.pipeline().last()
exstream.last(stream)
```

## Related

[`head()`](/docs/reference/head/), [`single()`](/docs/reference/single/), [`reduce1()`](/docs/reference/reduce-1/)
