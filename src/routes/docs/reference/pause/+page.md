<svelte:head><title>pause() — Exstream</title><meta name="description" content="Manually pause Exstream delivery, including upstream propagation, buffering, internal pressure, and resume rules." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/pause/" /></svelte:head>

<p class="eyebrow">API · Low level</p>

# `pause()`

<p class="lead">Stop this branch from accepting more delivery and propagate pressure upstream.</p>

## Signature

```typescript
pause(fromInside?: boolean): this
```

## Parameters

`fromInside` defaults to `false` and is an internal coordination flag. User code should omit it. External and internal pause reasons are tracked independently; both must be cleared before delivery resumes.

## Behavior

Pause is immediate, idempotent, and propagates to the source. Manual writes accepted while paused enter this stream's configured buffer and return `false`; overflow follows `bufferLimit` and `overflow`. Existing buffered values remain until resume, graceful end, or destructive termination.

Use pause/resume only for adapter-level integration. Normal operators, `pipe()`, async consumers, and terminals already coordinate backpressure automatically.

## Related

[`resume()`](/docs/reference/resume/), [`write()`](/docs/reference/write/), [`consume()`](/docs/reference/consume/)
