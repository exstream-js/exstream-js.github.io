<svelte:head>
  <title>compact() — Exstream</title>
  <meta name="description" content="Remove falsy values from an Exstream, with complete ordering, typing, context, and memory behavior." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/reference/compact/" />
</svelte:head>

<p class="eyebrow">API · Transform</p>

# `compact()`

<p class="lead">Remove JavaScript falsy values while preserving every other value unchanged.</p>

## Example

```javascript
await exstream([0, 1, false, 2, '', null, 3]).compact().toArray()
// [1, 2, 3]
```

## Behavior

`compact()` drops exactly `false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN`, following normal JavaScript truthiness. Values such as empty arrays, empty objects, and the string `'0'` remain.

It is synchronous, stable, and one-to-zero-or-one: output order is unchanged, no queue is added, and downstream pressure propagates upstream. Record contexts pass through with retained values. Existing record errors pass through and do not participate in the truthiness test.

## Errors

`compact()` has no callback and does not create operator errors. Unhandled record errors and fatal failures retain their normal pipeline behavior.

## Forms

Available on streams and reusable pipelines. The standalone form takes the stream directly:

```javascript
stream.compact()
exstream.pipeline().compact()
exstream.compact(stream)
```

## Signature

```typescript
compact(): Exstream<Exclude<T, false | 0 | '' | null | undefined>, C>
```

## Related

[`filter()`](/docs/reference/filter/), [`reject()`](/docs/reference/reject/), [`isDefined()` on the utility API](https://github.com/micheletriaca/exstream)
