<svelte:head>
  <title>map() — Exstream</title>
  <meta name="description" content="Transform every Exstream value synchronously, with complete map() parameters, output modes, and error behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/map/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `map()`

<p class="lead">Run a synchronous callback for every successful input and emit exactly one result.</p>

## Signature

```typescript
map<U>(
  fn: (value: T, context: CallbackContext<T, C>) => U,
  options: { wrap: true },
): Exstream<
  U extends PromiseLike<infer R>
    ? Promise<{ input: T; output: Awaited<R> }>
    : { input: T; output: U },
  MaterializedContext<C, T>
>

map<U>(
  fn: (value: T, context: CallbackContext<T, C>) => U,
  options?: MapOptions | null,
): Exstream<U, NextContext<C, U>>

interface MapOptions {
  wrap?: boolean
}
```

## Example

```javascript
const totals = exstream(rows).map((row) => ({
  ...row,
  total: Number(row.total),
}))
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; U</code></span><span><strong>Required</strong></span></p>
      <p>Called once for every successful value. The callback is synchronous. Declare the second parameter only when record metadata or its cancellation signal is needed; Exstream materializes a context lazily.</p>
    </dd>
  </div>
  <div>
    <dt><code>wrap</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>boolean</code></span><span><strong>Default</strong> <code>false</code></span></p>
      <p>When <code>true</code>, emits <code>&#123; input, output &#125;</code> so the transformed result stays associated with its original input. The JavaScript implementation tests this field by truthiness, while the public TypeScript API intentionally accepts booleans only. Passing <code>null</code> or <code>undefined</code> as the options object applies the default.</p>
    </dd>
  </div>
</dl>

## Behavior

`map()` preserves input order and adds no independent queue. It asks upstream for work only while downstream can accept it. Existing record errors pass through without calling `fn`.

When requested, `context.input` is the value that created the current context, `context.signal` aborts when this branch should stop, and any custom fields added upstream remain available. The same materialized context continues with the mapped output unless a later branch boundary copies it.

The callback result is emitted as-is, including `undefined`, arrays, streams, and asynchronous values. A native promise, or an object exposing both callable `then` and `catch` properties, is recognized for rejection wrapping and `wrap` handling. A minimal thenable with only `then` is emitted as an ordinary value. Returning any promise does not make `map()` await it or limit concurrent work:

```javascript
const pending = exstream(ids).map((id) => fetch(`/items/${id}`))
// Exstream<Promise<Response>, C>
```

Use [`mapAsync()`](/docs/reference/map-async/) for awaited output, bounded concurrency, ordering controls, retries, or timeouts.

## Wrapped output

```javascript
const compared = exstream(records).map(calculateScore, { wrap: true })
// { input: originalRecord, output: score }
```

If `calculateScore` returns a promise, each emitted value is a promise that resolves to the wrapped object.

## Errors

If `fn` throws, Exstream emits a contextual record error for that input and continues when an error policy handles it. A returned promise rejection is wrapped only when a downstream promise-aware operator such as `resolve()` observes it. Fatal graph failures bypass `map()` and abort the branch.

## Forms

`map()` is available on a stream, in a reusable pipeline, and as a standalone operator. The direct standalone form requires an explicit options argument; use `null` for defaults:

```javascript
stream.map(fn, { wrap: true })
exstream.pipeline().map(fn, { wrap: true })
exstream.map(fn, null, stream)
stream.through(exstream.map(fn, { wrap: true }))
```

## Related

[`filter()`](/docs/reference/filter/), [`flatMap()`](/docs/reference/flat-map/), [`tap()`](/docs/reference/tap/), [`mapAsync()`](/docs/reference/map-async/)
