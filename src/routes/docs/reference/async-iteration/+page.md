<svelte:head>
  <title>for await...of — Exstream</title>
  <meta name="description" content="Consume Exstream directly with pull-based JavaScript async iteration." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/async-iteration/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `for await...of`

<p class="lead">Pull one output value at a time through JavaScript's native async-iteration protocol.</p>

## Example

```javascript
for await (const record of pipeline) {
  await destination.write(record)
}
```

## Demand and cancellation

Each `next()` requests one record. Concurrent reads are serialized in call order, and awaiting work inside a `for await` loop naturally holds downstream pressure.

Breaking the loop calls the iterator's `return()` method and cancels that consumer branch. To cancel from elsewhere, attach an abort signal to the source or to the terminal operation that owns the iteration.

The first unhandled record error or fatal graph failure rejects the pending read. Later reads report completion.

## Manual reads

```javascript
const iterator = pipeline[Symbol.asyncIterator]()
const first = await iterator.next()
await iterator.return()
```

Prefer `for await` unless you specifically need protocol-level control.

## Signature

```typescript
[Symbol.asyncIterator](): AsyncIterableIterator<T>
```

## Related

[`pipeTo()`](/docs/reference/pipe-to/), [`drain()`](/docs/reference/drain/), [`toNodeReadable()`](/docs/reference/to-node-readable/), [`toWebReadable()`](/docs/reference/to-web-readable/)
