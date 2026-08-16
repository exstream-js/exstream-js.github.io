<svelte:head><title>resume() — Exstream</title><meta name="description" content="Resume Exstream delivery and flush buffered records, including internal pause gates, source iteration, and terminal states." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/resume/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `resume()`

<p class="lead">Clear an external pause and allow buffered or source values to flow while downstream is ready.</p>

## Signature

```typescript
resume(fromInside?: boolean): this
```

## Behavior

User calls omit `fromInside`, clearing the external pause flag. Delivery restarts only when no internal pause remains, autostart is enabled, async consumers/generators have called `next()`, and the stream is not terminal.

Resume flushes buffered frames first, stopping again if downstream applies pressure. It then advances iterable or generator sources and emits `drain` for writable roots when capacity is available. Calls after termination are no-ops.

Attaching standard terminals resumes their sink automatically. Direct `resume()` without a consumer can start a source only where graph demand permits; use `drain()` to intentionally consume and discard output.

## Related

[`pause()`](/docs/reference/pause/), [`start()`](/docs/reference/start/), [`drain()`](/docs/reference/drain/)
