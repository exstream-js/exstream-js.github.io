<svelte:head><title>each() — Exstream</title><meta name="description" content="Run a callback for every Exstream value, including startup, context, errors, return value, pressure, and completion limitations." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/each/" /></svelte:head>

<p class="eyebrow">API · Consume</p>

# `each()`

<p class="lead">Start a stream and run a synchronous side-effect callback for every successful value.</p>

## Signature

```typescript
each(fn: (value: T, context: C) => void): void
```

## Example

```javascript
stream.each((value) => console.log(value))
```

## Behavior

`each()` attaches and resumes a terminal consumer immediately. The callback runs in input order. Context is supplied only when the callback declares a second parameter, and is materialized when needed. The method returns `undefined` and offers no completion promise.

The callback is synchronous: returned promises are ignored and do not apply backpressure. Use `mapAsync(...).drain()` for awaited side effects. Record errors are emitted on the end-of-chain `'error'` event; without a listener they can escape as uncaught failures. Prefer `drain()` or `toAsyncIterator()` when structured completion/error handling matters.

## Related

[`tap()`](/docs/reference/tap/), [`drain()`](/docs/reference/drain/), [`toArray()`](/docs/reference/to-array/), [`pull()`](/docs/reference/pull/)
