<svelte:head>
  <title>omit() — Exstream</title>
  <meta name="description" content="Remove selected fields from Exstream object records without mutating the input, including typing and errors." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/omit/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `omit()`

<p class="lead">Shallow-copy each record and remove one or more selected fields.</p>

## Signature

```typescript
omit<K extends keyof T>(fields: K | readonly K[]): Exstream<Omit<T, K>, C>
```

## Example

```javascript
const safeUsers = exstream(users).omit(['passwordHash', 'resetToken'])
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fields</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>PropertyKey | readonly PropertyKey[]</code></span><span><strong>Required</strong></span></p>
      <p>A single key or array of keys. Missing keys are ignored. Dot paths are not traversed: <code>'profile.email'</code> means a literal property with that name.</p>
    </dd>
  </div>
</dl>

## Behavior

`omit()` creates a shallow object using spread syntax and deletes requested keys from that copy. Enumerable own string and symbol properties are copied; the original object and nested values are not cloned or mutated. Inherited fields are not copied, even if named in `fields`.

It is synchronous, stable, one-to-one, context-preserving, and adds no independent buffer.

## Errors

An input that cannot be checked with the `in` operator produces a record error. Deleting a non-configurable property does not matter because deletion occurs on the fresh ordinary copy. Existing record errors pass through.

## Forms

```javascript
stream.omit('password')
exstream.pipeline().omit(['password', 'token'])
exstream.omit(['password', 'token'], stream)
stream.through(exstream.omit('password'))
```

## Related

[`pick()`](/docs/reference/pick/), [`pluck()`](/docs/reference/pluck/), [`map()`](/docs/reference/map/)
