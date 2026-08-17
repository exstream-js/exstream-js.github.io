<svelte:head>
  <title>drain() — Exstream</title>
  <meta name="description" content="Run Exstream to completion while discarding output, with complete demand, memory, completion, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/drain/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `drain()`

<p class="lead">Supply terminal demand, discard every successful output, and wait for the pipeline to finish.</p>

## Signature

```typescript
drain(): Promise<void>
```

## Example

```javascript
await exstream(events)
  .mapAsync(publishEvent, { concurrency: 8 })
  .tap(() => metrics.increment('events.published'))
  .drain()
```

## Behavior

`drain()` is a terminal consumer. It starts downstream demand immediately, consumes to normal source completion, discards successful values, and resolves with `undefined` only after asynchronous operators have finished.

Unlike `collect()` or `toArray()`, it retains no output array, so memory does not grow with the number of successful values. Operator-specific buffers and in-flight async work still apply.

Unlike `start()`, `drain()` creates an actual downstream consumer and returns an observable completion promise. Use it when the useful work happens in side-effecting operators and no destination needs the values.

## Errors

The first unhandled record error rejects the promise and aborts this branch. Fatal graph failures and cancellation also reject with their reason. Handle or route recoverable errors before `drain()` when processing should continue.

`drain()` is an instance-only terminal and cannot be placed in a reusable pipeline definition.

## Related

[`tap()`](/docs/reference/tap/), [`pipeTo()`](/docs/reference/pipe-to/), [`collect()`](/docs/reference/collect/), [consume a pipeline](/docs/learn/consume/)
