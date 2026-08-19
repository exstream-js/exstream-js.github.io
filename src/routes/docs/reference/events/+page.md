<svelte:head><title>Events — Exstream</title><meta name="description" content="Subscribe to Exstream lifecycle and error events with on, once, off, emit, listener inspection, and cleanup semantics." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/events/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# Events

<p class="lead">Observe lifecycle boundaries using the Node-compatible event API available in every runtime.</p>

## Methods

```typescript
on(event: string | symbol, listener: (...args: any[]) => void): this
once(event: string | symbol, listener: (...args: any[]) => void): this
off(event: string | symbol, listener: (...args: any[]) => void): this
emit(event: string | symbol, ...args: any[]): boolean
listenerCount(event: string | symbol): number
eventNames(): Array<string | symbol>
removeAllListeners(event?: string | symbol): this
setMaxListeners(count: number): this
```

Node uses its native event base. Browser builds provide the same listed surface; `setMaxListeners()` is a chainable no-op there. `once()` listeners can be removed with the original callback. `emit()` returns whether listeners existed. An unhandled browser `'error'` event throws, matching Node's important behavior.

## Exstream events

| Event   | Arguments      | When                                                                                                             |
| ------- | -------------- | ---------------------------------------------------------------------------------------------------------------- |
| `error` | `error`        | A record error has no downstream handler/consumer, or an abort/fatal reason is observed by a registered listener |
| `fatal` | `error, input` | A non-recoverable source, operator, format, or destination failure propagates through the graph                  |
| `abort` | `reason`       | State transitions to aborted                                                                                     |
| `end`   | none           | Readable stream reaches any terminal state                                                                       |
| `drain` | none           | Writable root can accept production again                                                                        |

Platform adapters can also surface familiar events such as `finish` or `close`. Terminal cleanup removes stream listeners, so register lifecycle observers before consumption begins. Events are synchronous; throwing listeners can interrupt their caller.

## Related

[`stream state`](/docs/reference/stream-state/), [`write()`](/docs/reference/write/), [`errors()`](/docs/reference/errors/), [`pipeTo()`](/docs/reference/pipe-to/)
