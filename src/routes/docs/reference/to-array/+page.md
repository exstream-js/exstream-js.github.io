<svelte:head>
  <title>toArray() — Exstream</title>
  <meta name="description" content="Collect an Exstream and invoke a callback, including memory, context, startup, errors, and return value." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-array/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toArray()`

<p class="lead">Start the stream, collect successful values, and invoke a callback once at completion.</p>

## Signature

```typescript
toArray(fn: (values: T[], context: AggregateContext<T[], C>) => void): void
```

## Example

```javascript
exstream(rows).toArray((values) => {
  console.log(`received ${values.length} rows`)
})
```

## Parameters

<dl class="parameter-list"><div><dt><code>fn</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>(values, context) =&gt; void</code></span><span><strong>Required</strong></span></p><p>Called once with the complete array. Context is supplied only when the callback declares a second parameter.</p></dd></div></dl>

## Completion and memory

This is a terminal callback API: it resumes the pipeline immediately, returns `undefined`, and retains every successful value until end. It is unsuitable for infinite or memory-unbounded input. The callback receives an aggregate context when contexts were materialized.

## Errors

Record errors are emitted as `'error'` events on the end of the chain and are not included in the array. Without an error listener this can become an uncaught runtime error. `toArray()` offers no rejection channel; prefer [`toPromise()`](/docs/reference/to-promise/) for structured async error handling.

## Forms

```javascript
stream.toArray(callback)
exstream.toArray(callback, stream)
exstream.toArray(callback)(stream)
```

## Related

[`toPromise()`](/docs/reference/to-promise/), [`collect()`](/docs/reference/collect/), [`values()`](/docs/reference/values/)
