<svelte:head>
  <title>defer() — Exstream</title>
  <meta name="description" content="Create an Exstream source only after graph activation and downstream demand, with synchronous or asynchronous resource acquisition." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/defer/" />
</svelte:head>

<p class="eyebrow">API · Create</p>

# `defer()`

<p class="lead">Move source creation and resource acquisition inside the Exstream activation lifecycle.</p>

## Example

```javascript
const rows = exstream
  .defer(async () => {
    const response = await fetch('/orders.jsonl')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.body
  })
  .jsonl()

await rows.pipeTo(destination)
```

## Why it is different from `exstream(source)`

`exstream(source)` reads pull-based sources on demand, but JavaScript evaluates `source` first. `exstream(fetch(url))` has already started the request; `exstream(createReadStream(path))` has already opened the resource. `defer(() => source)` delays that creation until the graph is activated and downstream can consume it.

The factory may return an iterable, async iterable, Web `ReadableStream`, Node readable, Exstream generator, existing Exstream, or a promise for one. It is invoked exactly once for this Exstream execution. A thrown error, rejected acquisition promise, or invalid returned source enters the source-error path.

## Activation and cancellation

Operators and reliable forks may be attached without invoking the factory. An already-aborted source never invokes it. In automatic mode, terminal demand activates the graph. With `{ start: 'manual' }`, the factory remains untouched until `start()` opens the root graph and downstream demand is present.

```javascript
const source = exstream.defer(() => openCursor(), { start: 'manual' })
const first = source.fork().pipeTo(firstDestination)

await prepareSecondDestination()
const second = source.fork().pipeTo(secondDestination)

await source.start()
await Promise.all([first, second])
```

`defer()` is single-use and does not replay. Create a new deferred Exstream when the recipe must execute again.

## Signature

```typescript
function defer<T, C extends object>(
  factory: () => Exstream<T, C> | StreamSource<T> | PromiseLike<Exstream<T, C> | StreamSource<T>>,
  options?: StreamOptions | null,
): Exstream<T, C>
```

## Related

[`exstream()`](/docs/reference/exstream/), [`start()`](/docs/reference/start/), [`fork()`](/docs/reference/fork/), [Create a source](/docs/learn/sources/#deferred-sources)
