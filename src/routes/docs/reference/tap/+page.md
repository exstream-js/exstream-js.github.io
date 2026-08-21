<svelte:head>
  <title>tap() — Exstream</title>
  <meta name="description" content="Run synchronous Exstream side effects without changing values, with complete execution and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/tap/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `tap()`

<p class="lead">Run a synchronous side effect for every successful value, then pass that value through unchanged.</p>

## Example

```javascript
await exstream(records)
  .tap((record) => metrics.seen(record.type))
  .mapAsync(storeRecord, { concurrency: 8 })
  .drain()
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown</code></span><span><strong>Required</strong></span></p>
      <p>Called synchronously once for each successful value. Its return value is ignored. Declare the second parameter to access the record context and cancellation signal.</p>
    </dd>
  </div>
</dl>

## Behavior

`tap()` preserves each value, its context, and input order. Existing record errors pass through without running the callback. The operator adds no queue and follows normal downstream demand.

When requested, the callback context exposes `context.input`, the branch cancellation `context.signal`, and custom fields added upstream. Because the value is unchanged, the same context continues downstream.

Like every intermediate operator, `tap()` is lazy: attaching it does not consume the source. End the chain with `drain()`, `pipeTo()`, an async iterator, or another terminal consumer when the side effect must actually run.

## Async work

Returned promises are ignored and not awaited. A rejecting promise may become an unhandled rejection outside Exstream’s error protocol:

```javascript
// Awaited, bounded, and reported through Exstream:
await exstream(records)
  .mapAsync((record) => audit.write(record), { concurrency: 4 })
  .drain()
```

Use `tap()` for immediate actions such as counters, logs, or in-memory observation; use [`mapAsync()`](/docs/reference/map-async/) for asynchronous effects.

## Errors

A synchronous throw becomes a contextual record error for the current input. Handle it downstream or promote it with `failOnError()`. Fatal failures abort the branch.

## Forms

`tap()` is available on streams and reusable pipelines:

```javascript
stream.tap(fn)
exstream.pipeline().tap(fn)
```

## Signature

```typescript
tap(
  fn: (value: T, context: CallbackContext<T, C>) => unknown,
): Exstream<T, C>
```

## Related

[`map()`](/docs/reference/map/), [`mapAsync()`](/docs/reference/map-async/), [`drain()`](/docs/reference/drain/)
