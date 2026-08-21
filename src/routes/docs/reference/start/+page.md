<svelte:head><title>start() — Exstream</title><meta name="description" content="Freeze and activate a manually gated Exstream source graph, including reliable fork registration, idempotency, and terminal demand." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/start/" /></svelte:head>

<p class="eyebrow">API · Lifecycle</p>

# `start()`

<p class="lead">Freeze a manually built graph and authorize its root source to run.</p>

## Example

```javascript
const source = exstream(rows, { start: 'manual' })
const left = source.fork().map(leftTransform).toArray()

await discoverRightTransform()
const right = source.fork().map(rightTransform).toArray()

await source.start()
const [a, b] = await Promise.all([left, right])
```

## Behavior

Startup is scheduled for the next turn so downstream pipes can finish attaching. Concurrent calls anywhere in the transformed graph reach the same root activation and return the same promise. The source starts once. The promise resolves when the gate is released, not when data processing finishes.

Before activation, reliable forks may be registered in different timers or awaited setup phases. Once activation begins, the graph is frozen and a later `fork()` throws. A source created with `defer()` does not invoke its factory before this boundary.

`start()` is not a terminal consumer and creates no downstream demand. Calling it on a pipeline with no attached sink leaves that pipeline paused. Use `drain()` to run and await a side-effecting pipeline. Calls after termination resolve harmlessly.

## Signature

```typescript
start(): Promise<void>
```

## Related

[`defer()`](/docs/reference/defer/), [`fork()`](/docs/reference/fork/), [`drain()`](/docs/reference/drain/)
