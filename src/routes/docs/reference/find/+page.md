<svelte:head>
  <title>find() — Exstream</title>
  <meta name="description" content="Emit the first matching Exstream value and stop, including predicate, context, errors, and cancellation behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/find/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `find()`

<p class="lead">Emit the first value accepted by a synchronous predicate, then stop this branch.</p>

## Signature

```typescript
find<S extends T>(fn: (value: T, context: C) => value is S): Exstream<S, C>
find(fn: (value: T, context: C) => unknown): Exstream<T, C>
```

## Example

```javascript
const firstOverdue = await exstream(invoices)
  .find((invoice) => invoice.status === 'overdue')
  .single()
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown</code></span><span><strong>Required</strong></span></p>
      <p>Runs synchronously for successful values until its first truthy result. A TypeScript type predicate narrows the output type. Declare <code>context</code> only when needed.</p>
    </dd>
  </div>
</dl>

## Behavior

The matching value is included. If nothing matches, the stream ends without emitting a value. `find()` is equivalent to `filter(fn).take(1)`: it preserves order, adds no independent buffer, and destroys its consuming branch immediately after the match so upstream work can be cancelled when no sibling still needs it.

Record errors pass through and do not call `fn`. A handled error does not end the search. Context follows the matched value.

## Errors

If `fn` throws, the failure becomes a record error for that input. `find()` does not await promises; a returned promise is truthy, so use [`asyncFilter()`](/docs/reference/async-filter/) followed by [`head()`](/docs/reference/head/) for an asynchronous predicate.

## Forms

```javascript
stream.find(predicate)
exstream.pipeline().find(predicate)
exstream.find(predicate, stream)
stream.through(exstream.find(predicate))
```

## Related

[`filter()`](/docs/reference/filter/), [`findWhere()`](/docs/reference/find-where/), [`head()`](/docs/reference/head/), [`stopWhen()`](/docs/reference/stop-when/)
