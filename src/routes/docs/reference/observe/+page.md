<svelte:head>
  <title>observe() — Exstream</title>
  <meta name="description" content="Create a non-blocking Exstream observer with complete buffer, overflow, cancellation, and failure semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/observe/" />
</svelte:head>

<p class="eyebrow">API · Graph</p>

# `observe()`

<p class="lead">Create a best-effort branch that never applies backpressure to the reliable flow.</p>

## Signature

```typescript
observe(options?: ObserveOptions | null): Exstream<T, C>

interface ObserveOptions {
  bufferLimit?: number
  overflow?: 'error' | 'drop-oldest' | 'drop-newest'
  signal?: AbortSignal
}
```

## Example

```javascript
const metrics = source.observe({
  bufferLimit: 100,
  overflow: 'drop-oldest',
})
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>bufferLimit</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>non-negative integer | Infinity</code></span><span><strong>Default</strong> <code>Infinity</code></span></p>
      <p>Maximum queued observer records. Use a finite value for long-running or unbounded sources. Zero is valid with a drop policy and retains no values while the observer is unable to accept them.</p>
    </dd>
  </div>
  <div>
    <dt><code>overflow</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>'error' | 'drop-oldest' | 'drop-newest'</code></span><span><strong>Default</strong> <code>'error'</code></span></p>
      <p><code>error</code> aborts only the observer when its buffer fills. <code>drop-oldest</code> makes room for the new record; <code>drop-newest</code> discards the incoming record. Drop policies require a finite <code>bufferLimit</code>.</p>
    </dd>
  </div>
  <div>
    <dt><code>signal</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Aborts the observer branch without cancelling reliable siblings.</p>
    </dd>
  </div>
</dl>

Passing `null` or `undefined` applies all defaults.

At runtime `bufferLimit` is normalized with `Number()`, so any value coercing to a non-negative integer or `Infinity` satisfies the limit. The TypeScript API intentionally requires a number. Invalid signal shapes and invalid limit/policy combinations throw while the observer is created; unrelated non-object option values are treated like defaults.

## Delivery

The source never waits for an observer. Retained values preserve source order, but a drop policy may create gaps. Observer completion can lag behind reliable completion while its queue drains. Context is copied at the observation boundary.

An observer does not count as a reliable consumer and does not, by itself, drive a cold source. Consume the main source through a terminal operation, attach a reliable fork, or explicitly start the source. Destroying the observer detaches it without ending the source.

Metrics, previews, and diagnostics often tolerate this contract. Required audit, billing, or persistence work should use [`fork()`](/docs/reference/fork/) instead.

## Errors

Observer overflow with the default policy and failures inside the observer abort that observer branch. They do not abort reliable siblings. A fatal failure originating in the shared source still reaches every attached branch.

## Forms

`observe()` is a graph operation on a concrete stream. It is not available on reusable pipeline definitions and has no standalone operator form.

## Related

[`fork()`](/docs/reference/fork/), [backpressure](/docs/concepts/backpressure/), [branch and observe](/docs/learn/branching/)
