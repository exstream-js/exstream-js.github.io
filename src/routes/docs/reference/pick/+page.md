<svelte:head>
  <title>pick() — Exstream</title>
  <meta name="description" content="Keep selected own or inherited object fields in Exstream records, with complete input, output, and error behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/pick/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `pick()`

<p class="lead">Create a new object containing only the requested fields from each record.</p>

## Example

```typescript
const publicUsers = exstream(users).pick(['id', 'displayName'] as const)
```

## Parameters

<dl class="parameter-list">
  <div>
    <dt><code>fields</code></dt>
    <dd>
      <p class="parameter-meta"><span><strong>Type</strong> <code>readonly PropertyKey[]</code></span><span><strong>Required</strong></span></p>
      <p>String, number, or symbol keys to copy. Missing keys are omitted. A readonly tuple preserves the exact output keys in TypeScript.</p>
    </dd>
  </div>
</dl>

## Behavior

Each successful input produces a fresh plain object. Keys are tested with the `in` operator, so inherited properties are included and read through normal property access. Property descriptors and the input prototype are not copied. Duplicate field names simply assign the same output property again.

The operator is synchronous, stable, one-to-one, context-preserving, and backpressure-aware. It does not mutate the input.

## Errors

Applying `pick()` to `null`, `undefined`, or another value that cannot be used with `in` produces a record error for that input. Existing record errors pass through.

## Forms

```javascript
stream.pick(['id', 'name'])
exstream.pipeline().pick(['id', 'name'])
exstream.pick(['id', 'name'], stream)
stream.through(exstream.pick(['id', 'name']))
```

## Signature

```typescript
pick<K extends keyof T>(fields: readonly K[]): Exstream<Pick<T, K>, C>
```

## Related

[`omit()`](/docs/reference/omit/), [`pluck()`](/docs/reference/pluck/), [`map()`](/docs/reference/map/)
