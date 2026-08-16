<svelte:head>
  <title>toAsyncIterator() — Exstream</title>
  <meta name="description" content="Consume Exstream with a pull-based async iterator, including signal, read, return, throw, and error semantics." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/to-async-iterator/" />
</svelte:head>

<p class="eyebrow">API · Consume</p>

# `toAsyncIterator()`

<p class="lead">Expose a pull-based async iterator that requests exactly one pipeline record for each read.</p>

## Signature

```typescript
toAsyncIterator(
  options?: { signal?: AbortSignal } | null,
): AsyncIterableIterator<T>
```

## Example

```javascript
for await (const record of pipeline.toAsyncIterator({ signal })) {
  await destination.write(record)
}
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>signal</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>AbortSignal</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Aborts the iterator branch with the signal's reason. A pre-aborted signal prevents its source from starting. The listener is removed after completion.</p>
    </dd>
  </div>
</dl>

Passing `null` or `undefined` as the options object applies the default. Other non-object values, arrays, and invalid signal shapes throw synchronously.

## Reads

`next()` starts demand and pulls exactly one record. Concurrent `next()` calls are serialized in call order without additional read-ahead. After normal completion, every later call resolves to `{ done: true, value: undefined }`.

The iterator is self-iterable, so it works directly with `for await`. Awaiting work inside the loop naturally holds downstream pressure.

## Cancellation

`return(value)` destroys the iterator branch, cancels its active record context, resolves a pending read as done, and resolves to `{ done: true, value }`. Breaking a `for await` loop invokes it automatically.

`throw(error)` aborts the branch with that reason and rejects. An external signal has the same branch-abort effect.

## Errors

The first unhandled record error or fatal graph failure rejects the pending read and closes the iterator. Later `next()` calls report completion. Handle recoverable errors upstream when iteration should continue.

## Forms

`toAsyncIterator()` is terminal and cannot be placed in a reusable pipeline. The standalone form takes options before the stream, or returns a curried converter:

```javascript
stream.toAsyncIterator(options)
exstream.toAsyncIterator(options, stream)
exstream.toAsyncIterator(options)(stream)
```

Pass `null` as the first argument in the direct standalone form when no options are needed.

## Related

[`pipeTo()`](/docs/reference/pipe-to/), [`drain()`](/docs/reference/drain/), [consume a pipeline](/docs/learn/consume/)
