<svelte:head><title>end() — Exstream</title><meta name="description" content="Gracefully end an Exstream after buffered values, including propagation, events, idempotency, and post-end writes." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/end/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `end()`

<p class="lead">Gracefully finish a stream after delivering values already accepted into its buffer.</p>

## Signature

```typescript
end(): void
```

## Example

```javascript
source.write(first)
source.write(second)
source.end()
```

## Behavior

`end()` queues the end marker, force-flushes buffered records if needed, transitions to `ended`, emits `end` once for readable streams, detaches consumers/observers, and releases source resources. Repeated terminal calls are no-ops; the first terminal state wins.

Graceful end differs from `destroy()` and `abort()`: accepted buffered values are delivered instead of discarded, and no abort reason is set. Downstream end propagation follows the connected graph. Later `write()` or `writeData()` calls throw.

`end()` is immediate in lifecycle terms and returns no completion promise. Await a terminal consumer such as `drain()` or `pipeTo()` when downstream completion matters.

## Related

[`destroy()`](/docs/reference/destroy/), [`abort()`](/docs/reference/abort/), [`drain()`](/docs/reference/drain/), [`write()`](/docs/reference/write/)
