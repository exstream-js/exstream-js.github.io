<script>
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
</script>

<svelte:head>
  <title>Consume a pipeline — Exstream</title>
  <meta name="description" content="Choose pipeTo, async iteration, drain, or collection as the terminal Exstream operation." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/consume/" />
</svelte:head>

<p class="eyebrow">Learn · Terminal operations</p>

# Consume a pipeline

<p class="lead">The terminal consumer starts demand, owns completion, and is where unhandled pipeline failures become visible.</p>

## Write to a stream

```javascript
await pipeline.pipeTo(destination)
```

<PlaygroundLink example="consume" />

Use `pipeTo()` for a Node-style writable or Web `WritableStream`. Its promise settles only when the transfer completes. It rejects on an unhandled record error, source or destination failure, structural format error, or cancellation.

## Pull with async iteration

```javascript
for await (const record of pipeline.toAsyncIterator()) {
  await writeRecord(record)
}
```

The loop body is the destination. Awaiting it before the next iteration naturally keeps the consumer from running ahead.

Pass a signal when the caller owns cancellation:

```javascript
for await (const record of pipeline.toAsyncIterator({ signal })) {
  await writeRecord(record)
}
```

## Run side effects

```javascript
await pipeline.tap(sendMetric).drain()
```

`drain()` supplies demand and discards output. Use it for a side-effecting pipeline with no writer. Unlike `start()`, it waits until completion or failure.

## Collect deliberately

```javascript
const records = await pipeline.toPromise()
```

Collection keeps the complete result in memory. It is appropriate only when the output is known to fit. For a large or unbounded flow, use a streaming destination instead.

## Name ownership

Application code should make the terminal operation easy to find. That line determines who waits, catches fatal errors, and cancels early. A pipeline without an intentional terminal owner is only a description.
