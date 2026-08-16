<svelte:head><title>Stream state — Exstream</title><meta name="description" content="Inspect Exstream lifecycle, pressure, buffering, drops, signals, and graph properties with exact states and invariants." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/stream-state/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# Stream state

<p class="lead">Inspect lifecycle and pressure without reaching into private queues.</p>

## Properties

| Property               | Type                                                                     | Meaning                                                    |
| ---------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `state`                | `'idle' \| 'running' \| 'ending' \| 'ended' \| 'destroyed' \| 'aborted'` | Current lifecycle state                                    |
| `ended`                | `boolean`                                                                | True for ended, destroyed, or aborted                      |
| `abortReason`          | `unknown`                                                                | Explicit abort/fatal reason; `null` for normal end/destroy |
| `signal`               | `AbortSignal`                                                            | Lazily created branch cancellation signal                  |
| `paused`               | `boolean`                                                                | Any active pause gate                                      |
| `pausedFromOutside`    | `boolean`                                                                | Manual/external pause gate                                 |
| `pausedFromInside`     | `boolean`                                                                | Operator/generator pressure gate                           |
| `buffered`             | `number`                                                                 | Currently queued data and error records                    |
| `peakBuffered`         | `number`                                                                 | Maximum queued record count observed                       |
| `dropped`              | `number`                                                                 | Records discarded by an overflow drop policy               |
| `bufferLimit`          | `number`                                                                 | Configured maximum queued records                          |
| `overflowPolicy`       | `'error' \| 'drop-oldest' \| 'drop-newest'`                              | Configured full-buffer action                              |
| `writable`, `readable` | `boolean`                                                                | Capability flags for adapters                              |
| `source`               | `Exstream                                                                | null`                                                      | Immediate upstream stream when connected  |
| `endOfChain`           | `Exstream                                                                | undefined`                                                 | Last stream assigned in a connected chain |

## Invariants

End markers do not count toward `buffered`. `peakBuffered` and `dropped` are cumulative for the stream lifetime. Accessing `signal` after termination returns an already-aborted signal with the stored lifecycle reason. State is read-only; use lifecycle methods to transition it.

These values are useful for diagnostics and observability, not for polling-based flow control. Producers should use the boolean from `write()` and the `drain` event.

## Related

[`events`](/docs/reference/events/), [`write()`](/docs/reference/write/), [`pause()`](/docs/reference/pause/), [`abort()`](/docs/reference/abort/)
