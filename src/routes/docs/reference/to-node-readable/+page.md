<svelte:head>
  <title>toNodeReadable() — Exstream</title>
  <meta name="description" content="Expose Exstream output as a backpressured Node Readable stream." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-node-readable/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toNodeReadable()`

<p class="lead">Expose Exstream output through Node's native `Readable` interface.</p>

## Signature

```typescript
toNodeReadable(options?: object | null): NodeReadableLike<T>
```

## Example

```javascript
const readable = exstream(rows).jsonlStringify().toNodeReadable()
readable.pipe(process.stdout)
```

## Behavior

The returned readable pulls from Exstream through its async iterator. Node demand and high-water marks therefore control upstream work; normal completion ends the readable, and destruction cancels the Exstream consumer branch.

`options` are forwarded to `Readable.from()`. Exstream uses object mode by default; pass standard Node readable options when another mode or water mark is required.

This adapter is available only in the Node runtime. Browser and portable entry points throw; use `toWebReadable()` there. Pipeline failures are emitted through the readable's `error` event, so attach an error handler or use `pipeTo()` when a completion promise is a better boundary.

## Related

[`toWebReadable()`](/docs/reference/to-web-readable/), [`pipeTo()`](/docs/reference/pipe-to/), [async iteration](/docs/reference/async-iteration/)
