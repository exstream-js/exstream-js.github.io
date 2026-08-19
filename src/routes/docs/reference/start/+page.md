<svelte:head><title>start() — Exstream</title><meta name="description" content="Release a manually gated Exstream source, including fork autostart, idempotency, scheduling, and the distinction from terminal consumption." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/start/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `start()`

<p class="lead">Release a source whose automatic startup was disabled, typically after wiring reliable forks.</p>

## Example

```javascript
const source = exstream(rows)
const left = source.fork(true).map(leftTransform).toArray()
const right = source.fork(true).map(rightTransform).toArray()

await source.start()
const [a, b] = await Promise.all([left, right])
```

## Behavior

Startup is scheduled for the next turn so downstream pipes can finish attaching. Concurrent calls return the same promise and the source starts once. The promise resolves when the gate is released, not when data processing finishes.

`start()` is not a terminal consumer and creates no downstream demand. Calling it on a pipeline with no attached sink leaves that pipeline paused. Use `drain()` to run and await a side-effecting pipeline. Calls after termination resolve harmlessly.

## Signature

```typescript
start(): Promise<void>
```

## Related

[`fork()`](/docs/reference/fork/), [`drain()`](/docs/reference/drain/)
