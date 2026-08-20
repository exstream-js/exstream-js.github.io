<svelte:head>
  <title>toNodeTransform() — Exstream</title>
  <meta name="description" content="Expose a reusable Exstream pipeline as a native backpressured Node Transform stream." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-node-transform/" />
</svelte:head>

<p class="eyebrow">API · Interop</p>

# `toNodeTransform()`

<p class="lead">Convert a reusable pipeline definition into a native Node stream with writable input and readable output.</p>

## Example

```javascript
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline as nodePipeline } from 'node:stream/promises'

const normalize = exstream
  .pipeline()
  .csv({ header: true })
  .filter((order) => order.status === 'paid')
  .map((order) => ({ ...order, total: Number(order.total) }))
  .jsonlStringify()

await nodePipeline(
  createReadStream('./orders.csv'),
  normalize.toNodeTransform(),
  createWriteStream('./paid-orders.jsonl'),
)
```

## Behavior

The returned object is a native Node `Transform`. Values written on its writable side become the source of a fresh Exstream chain; values emitted by the final operator become readable chunks. Node demand controls how quickly Exstream reads and transforms input, and a slow downstream stream propagates pressure back to the upstream Node source.

If an operator such as `take()` completes the Exstream output before the Node input ends, the transform continues accepting and discarding the remaining input. This matches native Transform completion and lets `node:stream/promises.pipeline()` settle normally. Abort the enclosing Node pipeline when the upstream resource itself should be cancelled early.

Calling `toNodeTransform()` snapshots the pipeline definition at that moment. Operators appended later do not change an existing transform. Call the method again for another independent transform with fresh buffers, reducer state, key sets, and lifecycle.

Node stream chunks carry values, not Exstream record contexts. Operators inside the transform can use contexts normally, but metadata is not exposed after the output crosses back into the Node stream interface unless it was added to the output value.

## Errors and cancellation

An unhandled Exstream record error or fatal pipeline failure emits through the transform's Node `error` channel. `node:stream/promises.pipeline()` rejects with that error, including its Exstream provenance. Handle recoverable errors inside the reusable definition before creating the transform.

Destroying the transform or failing either connected Node stream cancels the Exstream branch and releases the opposite side. Normal input completion ends the pipeline and then the readable side.

## Runtime and method choice

This adapter is available only in the Node runtime. Browser and portable entry points throw.

Use `toNodeReadable()` when an Exstream already has a source and only needs to expose its output. Use `toNodeTransform()` on a source-free `pipeline()` definition when the native stream must accept input as well. Calling either method on the wrong object is rejected by TypeScript and fails immediately in JavaScript.

## Signature

```typescript
pipeline.toNodeTransform(): NodeTransformLike<Input, Output>
```

## Related

[`pipeline()`](/docs/reference/pipeline/), [`toNodeReadable()`](/docs/reference/to-node-readable/), [`through()`](/docs/reference/through/), [`pipeTo()`](/docs/reference/pipe-to/)
