<svelte:head><title>abort() — Exstream</title><meta name="description" content="Cancel an Exstream with a reason, including signal propagation, graph scope, buffers, events, and idempotency." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/abort/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `abort()`

<p class="lead">Cancel a branch and connected work with an explicit reason.</p>

## Signature

```typescript
abort(reason?: unknown): void
```

## Parameters

<dl class="parameter-list"><div><dt><code>reason</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>unknown</code></span><span><strong>Default</strong> generated <code>AbortError</code></span></p><p>Stored as <code>abortReason</code>, exposed through the branch signal, and propagated to connected consumers.</p></dd></div></dl>

## Behavior

Abort cancels `signal`, notifies downstream branches and observers, discards buffers, emits `abort(reason)` and `end`, and transitions to `aborted`. If this was the only reliable branch, the same reason propagates upstream; sibling forks isolate the shared source.

Cancellation is idempotent and the first reason wins. Errors with provenance support are annotated as lifecycle/abort. Terminal consumers reject when the abort reaches them. User asynchronous work must observe the supplied signal to stop promptly.

## Related

[`destroy()`](/docs/reference/destroy/), [`fail()`](/docs/reference/fail/), [async iteration](/docs/reference/async-iteration/), [`fork()`](/docs/reference/fork/)
