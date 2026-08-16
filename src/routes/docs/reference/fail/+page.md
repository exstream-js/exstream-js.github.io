<svelte:head><title>fail() — Exstream</title><meta name="description" content="Trigger a fatal Exstream graph failure with an optional input, including propagation, error metadata, cancellation, and terminal behavior." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/fail/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `fail()`

<p class="lead">Terminate the connected graph with a fatal error that record-level handlers cannot recover.</p>

## Signature

```typescript
fail(reason: unknown, input?: unknown): void
```

## Parameters

<dl class="parameter-list">
  <div><dt><code>reason</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>unknown</code></span><span><strong>Required</strong></span></p><p>Error, string, or other failure reason wrapped/annotated as an Exstream error.</p></dd></div>
  <div><dt><code>input</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>unknown</code></span><span><strong>Default</strong> <code>undefined</code></span></p><p>Optional value associated with the failure as <code>exstreamInput</code>.</p></dd></div>
</dl>

## Behavior

Exstream finds the root of this connected chain and propagates one fatal error downstream. The error has `exstreamFatal: true`, stage `fail`, and the supplied input. Signals are cancelled, buffers discarded, affected streams enter `aborted`, and terminal consumers reject.

Fatal failures bypass `errors()`, `skipErrors()`, and other record policies. Use `write(error)` for a recoverable record error and `fail()` only when continuing the graph is unsafe.

## Related

[`failOnError()`](/docs/reference/fail-on-error/), [`abort()`](/docs/reference/abort/), [`errors()`](/docs/reference/errors/), [`write()`](/docs/reference/write/)
