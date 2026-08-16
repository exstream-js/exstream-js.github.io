<svelte:head>
  <title>values() — Exstream</title>
  <meta name="description" content="Collect Exstream values with a synchronous array or asynchronous Promise return, including mode detection and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/values/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `values()`

<p class="lead">Collect all output, returning an array for synchronous pipelines and a promise for asynchronous ones.</p>

## Signature

```typescript
values(): T[] | Promise<T[]>
```

## Example

```javascript
const immediate = exstream([1, 2, 3]).map(double).values()
const eventual = await exstream(asyncRows).mapAsync(load).values()
```

## Return mode

Exstream follows the connected source chain's internal synchronous flag. Synchronous input and operators return `T[]` before the call returns. Generators, Node/Web streams, `mapAsync()`, `resolve()`, `makeAsync()`, and other asynchronous boundaries return `Promise<T[]>`.

Because the return type changes with runtime composition, library code should prefer `valuesSync()` when synchrony is required or `toPromise()` when a promise is required.

## Memory and errors

Every successful value is retained. Synchronous record errors throw during the call; asynchronous errors reject the promise. Infinite input never settles. The call consumes and starts the stream.

## Forms

`values()` is instance-only:

```javascript
stream.values()
```

## Related

[`valuesSync()`](/docs/reference/values-sync/), [`value()`](/docs/reference/value/), [`toPromise()`](/docs/reference/to-promise/)
