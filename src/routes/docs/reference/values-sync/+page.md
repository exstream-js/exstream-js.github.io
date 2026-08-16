<svelte:head>
  <title>valuesSync() — Exstream</title>
  <meta name="description" content="Collect a provably synchronous Exstream into an array, including asynchronous rejection, errors, memory, and context." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/values-sync/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `valuesSync()`

<p class="lead">Collect a synchronous pipeline now, and fail immediately if any connected stage is asynchronous.</p>

## Signature

```typescript
valuesSync(): T[]
```

## Example

```javascript
const result = exstream([1, 2, 3])
  .map((n) => n * 2)
  .valuesSync()
// [2, 4, 6]
```

## Synchrony contract

Before consuming, Exstream walks the source chain. If any stage is asynchronous, it throws `this stream is asynchronous. use .toPromise() instead of .valuesSync()` without pretending the result is immediate. Async sources and operators such as `resolve()`, `mapAsync()`, generators, Node/Web streams, and `makeAsync()` trigger that path.

Successful synchronous output is returned in order. Context behavior inside callbacks is unchanged, but only values are returned.

## Memory and errors

All values are retained until return. Record errors throw synchronously and stop collection. The call consumes the stream, so the same branch cannot later be attached to another consumer.

## Forms

`valuesSync()` is instance-only:

```javascript
stream.valuesSync()
```

## Related

[`values()`](/docs/reference/values/), [`value()`](/docs/reference/value/), [`toPromise()`](/docs/reference/to-promise/)
