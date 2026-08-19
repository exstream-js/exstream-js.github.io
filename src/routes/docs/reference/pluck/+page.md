<svelte:head>
  <title>pluck() — Exstream</title>
  <meta name="description" content="Read a property or nested field path from every Exstream value, including defaults, typing, and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/pluck/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `pluck()`

<p class="lead">Replace each input object with the value found at one property or nested field path.</p>

## Example

```javascript
exstream(users).pluck('profile.email', 'unknown@example.com')
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>field</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>string</code></span><span><strong>Required</strong></span></p>
      <p>A direct key or dot/bracket path such as <code>profile.email</code>, <code>items[0].sku</code>, or <code>rows["primary"].id</code>. TypeScript infers exact types only for direct keys.</p>
    </dd>
  </div>
  <div>
    <dt><code>defaultValue</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>unknown</code></span><span><strong>Default</strong> <code>undefined</code></span></p>
      <p>Returned when the path cannot be traversed or the final value is <code>undefined</code>. Existing values such as <code>null</code>, <code>false</code>, and <code>0</code> are preserved.</p>
    </dd>
  </div>
</dl>

## Behavior

`pluck()` is synchronous and is implemented as a `map()` with a precompiled getter. It emits one result per successful input, preserves order and context, adds no queue, and respects downstream pressure.

## Errors

A non-string field is rejected when the operator is created. Inputs that cannot be traversed return `defaultValue`; existing record errors pass through unchanged.

## Forms

The direct standalone form requires the default argument; use `undefined` when no fallback is wanted:

```javascript
stream.pluck('profile.email', 'missing')
exstream.pipeline().pluck('profile.email', 'missing')
exstream.pluck('profile.email', undefined, stream)
stream.through(exstream.pluck('profile.email', 'missing'))
```

## Signature

```typescript
pluck<K extends keyof T>(field: K): Exstream<T[K], C>
pluck<D = undefined>(field: string, defaultValue?: D): Exstream<unknown | D, C>
```

## Related

[`pick()`](/docs/reference/pick/), [`omit()`](/docs/reference/omit/), [`map()`](/docs/reference/map/)
