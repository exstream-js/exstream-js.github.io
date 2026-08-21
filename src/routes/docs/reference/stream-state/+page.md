<svelte:head><title>Stream state — Exstream</title><meta name="description" content="Inspect Exstream lifecycle, aggregate pressure, buffering, drops, and cancellation with exact states and invariants." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/stream-state/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# Stream state

<p class="lead">Inspect lifecycle and pressure without reaching into private queues.</p>

## Properties

| Property               | Type                                                                                                    | Meaning                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `state`                | <code>'idle' &#124; 'running' &#124; 'ending' &#124; 'ended' &#124; 'destroyed' &#124; 'aborted'</code> | Current lifecycle state                                    |
| `ended`                | `boolean`                                                                                               | True for ended, destroyed, or aborted                      |
| `abortReason`          | `unknown`                                                                                               | Explicit abort/fatal reason; `null` for normal end/destroy |
| `signal`               | `AbortSignal`                                                                                           | Lazily created branch cancellation signal                  |
| `paused`               | `boolean`                                                                                               | Whether aggregate backpressure currently stops this stream |
| `buffered`             | `number`                                                                                                | Currently queued data and error records                    |
| `peakBuffered`         | `number`                                                                                                | Maximum queued record count observed                       |
| `dropped`              | `number`                                                                                                | Records discarded by an overflow drop policy               |
| `bufferLimit`          | `number`                                                                                                | Configured maximum queued records                          |
| `overflowPolicy`       | <code>'error' &#124; 'drop-oldest' &#124; 'drop-newest'</code>                                          | Configured full-buffer action                              |
| `writable`, `readable` | `boolean`                                                                                               | Capability flags for adapters                              |

## Invariants

End markers do not count toward `buffered`. `peakBuffered` and `dropped` are cumulative for the stream lifetime. Accessing `signal` after termination returns an already-aborted signal with the stored lifecycle reason. Lifecycle and pressure state are read-only: downstream demand, normal completion, failures, and `AbortSignal` cancellation drive their transitions.

These values are useful for diagnostics and observability, not for polling-based flow control. Producers should use the boolean from `write()` and the `drain` event. Upstream graph links and individual scheduler pause gates are private implementation details.

## Related

[`events`](/docs/reference/events/), [`write()`](/docs/reference/write/), [`end()`](/docs/reference/end/), [`pipeTo()`](/docs/reference/pipe-to/)
