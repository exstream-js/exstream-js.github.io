<svelte:head>
  <title>uniq() — Exstream</title>
  <meta name="description" content="Keep the first Exstream value for each identity, callback key, property, or composite field tuple." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/uniq/" />
</svelte:head>

<p class="eyebrow">API · Select</p>

# `uniq()`

<p class="lead">Keep the first value for each identity or selected key, without changing input order.</p>

## Examples

```javascript
await exstream(['eu', 'us', 'eu', 'apac']).uniq().toArray()
// ['eu', 'us', 'apac']

const firstPerCustomer = exstream(orders).uniq('customerId')
const firstPerTenantEmail = exstream(users).uniq(['tenantId', 'email'])
const firstPerNormalizedEmail = exstream(users).uniq((user) => user.email.trim().toLowerCase())
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>selector</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>function | PropertyKey | readonly PropertyKey[]</code></span><span><strong>Optional</strong></span></p>
      <p>A synchronous key function, one property, or a list of properties forming a composite key. A property selector uses direct access and does not interpret dot paths.</p>
    </dd>
  </div>
</dl>

## Keys and equality

Without a selector, values are stored in a JavaScript `Set`. Callback keys use the same SameValueZero equality: `NaN` equals `NaN`, `0` equals `-0`, primitives compare by value, and objects compare by identity. Structurally equal object literals are therefore distinct unless they are the same reference.

Property selectors use a nested map for the complete tuple instead of converting it to a string. `['a', 'bc']` and `['ab', 'c']` remain distinct, as do the number `1` and the string `'1'`. An empty property array creates one empty tuple, so only the first input is emitted.

The selector is synchronous and may receive the record context as its second argument. Promise keys are not awaited and compare by promise identity.

## Memory and pressure

`uniq()` is stable, context-preserving, and adds no output queue. Its internal key index grows with distinct key cardinality until the branch ends. Do not use it on an infinite high-cardinality source unless that retention is acceptable.

## Errors

A thrown callback error or invalid property access becomes a record error for that input. Existing record errors pass through and are not indexed.

## Forms

```javascript
stream.uniq()
stream.uniq('id')
stream.uniq(['tenantId', 'id'])
stream.uniq((value, context) => value.id)

exstream.pipeline().uniq('id')
```

## Signature

```typescript
uniq(): Exstream<T, C>
uniq<K>(selector: (value: T, context: C) => K): Exstream<T, C>
uniq<K extends keyof T>(selector: K | readonly K[]): Exstream<T, C>
```

## Related

[`keyBy()`](/docs/reference/key-by/), [`groupBy()`](/docs/reference/group-by/), [`compact()`](/docs/reference/compact/)
