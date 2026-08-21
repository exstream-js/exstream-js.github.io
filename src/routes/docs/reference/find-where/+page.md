<svelte:head>
  <title>findWhere() — Exstream</title>
  <meta name="description" content="Emit the first Exstream object matching exact properties, including matching, early stop, context, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/find-where/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `findWhere()`

<p class="lead">Emit the first object matching every requested property, then stop this branch.</p>

## Example

```javascript
const admin = await exstream(users).findWhere({ role: 'admin', active: true }).single()
```

## Parameters

<dl class="parameter-list"><div><dt><code>properties</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>Partial&lt;T&gt;</code></span><span><strong>Required</strong></span></p><p>Shallow strict-equality matcher with the same semantics as <code>where()</code>.</p></dd></div></dl>

## Behavior

`findWhere(properties)` is exactly `where(properties).take(1)`. The match is included; empty or unmatched input emits nothing. It preserves context and releases this branch after the first match, though the range implementation can consume one later successful value while detecting completion.

Existing record errors pass through and do not end the search. Matching errors become record errors through `filter()`.

## Forms

```javascript
stream.findWhere({ id: 42 })
exstream.pipeline().findWhere({ id: 42 })
```

## Signature

```typescript
findWhere(properties: Partial<T>): Exstream<T, C>
```

## Related

[`where()`](/docs/reference/where/), [`find()`](/docs/reference/find/), [`head()`](/docs/reference/head/)
