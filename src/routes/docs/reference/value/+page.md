<svelte:head>
  <title>value() — Exstream</title>
  <meta name="description" content="Read the only Exstream value synchronously or asynchronously, including empty and multiple-value behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/value/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `value()`

<p class="lead">Consume a stream expected to contain zero or one successful value.</p>

## Signature

```typescript
value(): T | undefined | Promise<T | undefined>
```

## Example

```javascript
const user = await exstream(users).findWhere({ id }).value()
```

## Return mode

`value()` delegates to `values()`. A fully synchronous pipeline returns immediately; an asynchronous pipeline returns a promise. Zero values produce `undefined`, one produces that value, and more than one throws or rejects with an instruction to use `values()`.

The method consumes the complete stream to prove there is no second value; it does not stop after the first. It therefore inherits collection memory, startup, and error behavior from `values()`/`toPromise()`. Use `head().value()` when only the first value matters.

## Forms

`value()` is an instance-only convenience method:

```javascript
const sync = exstream([42]).value()
const async = await exstream(fetchRows()).value()
```

## Related

[`values()`](/docs/reference/values/), [`valuesSync()`](/docs/reference/values-sync/), [`head()`](/docs/reference/head/), [`toPromise()`](/docs/reference/to-promise/)
