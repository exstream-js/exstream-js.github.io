<svelte:head><title>fromEvent() — Exstream</title><meta name="description" content="Create an Exstream from EventTarget or EventEmitter events, including mapping, end/error events, hot-source buffering, overflow, and cleanup." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/from-event/" /></svelte:head>

<p class="eyebrow">API · Create</p>

# `fromEvent()`

<p class="lead">Adapt repeated browser or Node events into a hot Exstream source with explicit overflow policy.</p>

## Signature

```typescript
fromEvent<Args extends unknown[], T>(
  target: EventTargetLike | EventEmitterLike,
  event: string | symbol,
  options?: FromEventOptions<Args, T> | null,
): Exstream<T, RecordContext<T>> & { received: number }

interface FromEventOptions<Args extends unknown[], T> extends StreamOptions {
  map?: (...args: Args) => T
  end?: string | symbol | false
  error?: string | symbol | false
  highWaterMark?: number
}
```

## Example

```javascript
const messages = exstream.fromEvent(socket, 'message', {
  map: (event) => event.data,
  end: 'close',
  error: 'error',
  highWaterMark: 256,
  overflow: 'drop-oldest',
})
```

## Parameters

`target` must expose `addEventListener/removeEventListener` or `on/off`. `event` is the data event. By default, one event argument becomes the value and multiple arguments become an array; `map` replaces that rule. `end` defaults to `'end'`, `error` to `'error'`, and either can be `false` to disable its listener.

`highWaterMark` is the source buffer limit: default `1` for targets with `pause/resume`, otherwise `1024`. Non-pausable targets must use a finite limit. Although `FromEventOptions` extends `StreamOptions`, the adapter uses `highWaterMark` rather than `bufferLimit`; setting only `bufferLimit` has no effect. `overflow` defaults to `'error'`; drop policies are appropriate only when event loss is intentional. `signal` comes from `StreamOptions`.

## Hot-source behavior

`received` counts data events before mapping, including events later dropped or failed. Pausable targets are paused when `writeData()` reports pressure and resumed on `drain`. Non-pausable targets keep producing into the configured buffer. A mapping exception or configured error event is a fatal source failure. End, destroy, or abort removes every listener.

## Related

[`exstream()`](/docs/reference/exstream/), [`observe()`](/docs/reference/observe/), [`stream state`](/docs/reference/stream-state/)
