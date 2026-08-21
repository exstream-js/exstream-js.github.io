<svelte:head>
  <title>filter() — Exstream</title>
  <meta name="description" content="Keep Exstream values with a synchronous predicate, including type narrowing and error behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/filter/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `filter()`

<p class="lead">Keep successful values whose synchronous predicate returns a truthy result.</p>

## Example

```typescript
const paid = exstream(orders).filter((order) => order.status === 'paid')
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown</code></span><span><strong>Required</strong></span></p>
      <p>Called once for every successful value. Truthy results keep the value; falsy results drop it. A TypeScript type-predicate return narrows the output type. The optional context is materialized only when the callback declares its second parameter.</p>
    </dd>
  </div>
</dl>

## Behavior

Kept values are emitted unchanged and in input order. Dropped values do not consume an output slot: the operator continues requesting upstream records until downstream receives a kept value or the source ends. It has no separate buffer.

When requested, `context.input` identifies the value that created the context, `context.signal` follows branch cancellation, and custom fields added upstream are preserved. Kept values retain that same context object.

The predicate is not awaited. A returned promise is an object and therefore truthy, so it keeps the value regardless of its eventual result. Use [`mapAsync()`](/docs/reference/map-async/) followed by `filter()` when the decision requires asynchronous work.

Existing record errors pass through without invoking the predicate.

## Narrowing

```typescript
const values: Array<string | null> = ['Ada', null]

const names = exstream(values).filter((value): value is string => value !== null)
// Exstream<string, C>
```

## Errors

A thrown predicate error becomes a contextual record error associated with the current input. Handle it with [`errors()`](/docs/reference/errors/), `skipErrors()`, or another error policy. Fatal graph failures bypass the predicate and abort the branch.

## Forms

`filter()` is available on streams and reusable pipelines:

```javascript
stream.filter(predicate)
exstream.pipeline().filter(predicate)
```

## Signature

```typescript
filter<S extends T>(
  fn: (value: T, context: CallbackContext<T, C>) => value is S,
): Exstream<S, C>

filter(
  fn: (value: T, context: CallbackContext<T, C>) => unknown,
): Exstream<T, C>
```

## Related

[`map()`](/docs/reference/map/), [`flatMap()`](/docs/reference/flat-map/), [`skipErrors()`](/docs/reference/skip-errors/)
