<svelte:head><title>destroy() — Exstream</title><meta name="description" content="Stop an Exstream branch and discard buffered work, including upstream propagation, cancellation signals, and lifecycle state." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/destroy/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `destroy()`

<p class="lead">Stop this branch, discard buffered records, and release its resources without reporting a user failure.</p>

## Signature

```typescript
destroy(): void
```

## Behavior

The branch signal is aborted with an internally created `AbortError` named “The stream was destroyed,” buffers are cleared, state becomes `destroyed`, and `end` is emitted once. The public `abortReason` remains `null` because destroy is clean branch disposal rather than an explicit abort.

The branch detaches from upstream. If it was the last reliable consumer, destruction propagates upward and releases the source; sibling forks keep the shared source alive. Native readers, iterators, timers, and registered cleanup hooks are released.

Calling `destroy()` after any terminal state is a no-op. It does not preserve buffered output; use `end()` for graceful completion.

## Related

[`end()`](/docs/reference/end/), [`abort()`](/docs/reference/abort/), [`fork()`](/docs/reference/fork/), [`stopWhen()`](/docs/reference/stop-when/)
