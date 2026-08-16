<svelte:head>
  <title>where() — Exstream</title>
  <meta name="description" content="Filter Exstream object records by exact property matches, including matching semantics, inherited fields, errors, and forms." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/where/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `where()`

<p class="lead">Keep objects whose listed properties strictly equal the requested values.</p>

## Signature

```typescript
where(properties: Partial<T>): Exstream<T, C>
```

## Example

```javascript
const openItalian = exstream(orders).where({ country: 'IT', status: 'open' })
```

## Parameters

<dl class="parameter-list"><div><dt><code>properties</code></dt><dd><p class="parameter-meta"><span><strong>Type</strong> <code>Partial&lt;T&gt;</code></span><span><strong>Required</strong></span></p><p>All enumerable string properties visited by <code>for…in</code> must match with <code>===</code>. Symbol properties are not checked; inherited enumerable matcher properties are.</p></dd></div></dl>

## Matching

Comparison is shallow. Objects and arrays match by identity, `NaN` never matches itself, and a missing property can match an explicitly requested `undefined`. An empty matcher keeps every successful value.

`where()` is a synchronous `filter()`: it preserves order and context, adds no queue, and propagates pressure. Existing record errors pass through without matching.

## Errors

Reading a property from `null` or `undefined`, or from a throwing getter, becomes a `filter()` record error. Other primitives use normal JavaScript property access.

## Forms

```javascript
stream.where({ status: 'open' })
exstream.pipeline().where({ status: 'open' })
exstream.where({ status: 'open' }, stream)
stream.through(exstream.where({ status: 'open' }))
```

## Related

[`findWhere()`](/docs/reference/find-where/), [`filter()`](/docs/reference/filter/), [`pick()`](/docs/reference/pick/)
