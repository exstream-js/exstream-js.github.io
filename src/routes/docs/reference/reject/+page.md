<svelte:head>
  <title>reject() — Exstream</title>
  <meta name="description" content="Drop Exstream values that pass a synchronous test, including predicate, context, errors, and pressure behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/reject/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `reject()`

<p class="lead">Drop values for which a synchronous predicate returns a truthy result.</p>

## Example

```javascript
const active = exstream(accounts).reject((account) => account.disabled)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fn</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>(value, context) =&gt; unknown</code></span><span><strong>Required</strong></span></p>
      <p>Called once per successful value. Truthy means drop; falsy means emit. It is not awaited.</p>
    </dd>
  </div>
</dl>

## Behavior

`reject(fn)` is the inverse selection rule of `filter(fn)`. It is synchronous, stable, one-to-zero-or-one, adds no queue, and propagates downstream pressure upstream. Retained values keep their record context. Existing record errors pass through without calling `fn`.

## Errors

A thrown callback error becomes a contextual record error. A returned promise is truthy and therefore drops the value immediately. When a decision requires asynchronous work, attach its result with [`mapAsync()`](/docs/reference/map-async/) before applying a synchronous filter.

## Forms

```javascript
stream.reject(predicate)
exstream.pipeline().reject(predicate)
```

## Signature

```typescript
reject(fn: (value: T, context: C) => unknown): Exstream<T, C>
```

## Related

[`filter()`](/docs/reference/filter/), [`compact()`](/docs/reference/compact/), [`mapAsync()`](/docs/reference/map-async/)
