<svelte:head><title>extend() — Exstream</title><meta name="description" content="Add a custom method to every Exstream instance, including signature, prototype scope, typing, pipelines, and safety." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/extend/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# `extend()`

<p class="lead">Install a custom method on the shared Exstream prototype.</p>

## Signature

```typescript
extend(name: string, fn: (this: Exstream<any, any>, ...args: any[]) => unknown): void
```

## Example

```javascript
exstream.extend('double', function () {
  return this.map((value) => value * 2)
})

exstream([1, 2]).double().valuesSync()
```

## Behavior

The assignment is global to the loaded module instance and affects existing and future streams. Pipelines dynamically proxy methods found on `Exstream.prototype`, so a custom method can be recorded there too when it returns an Exstream-compatible operator chain.

There is no collision protection, name validation, uninstall API, or automatic TypeScript declaration augmentation. Reusing a built-in name replaces it. Use a unique name, a normal function when `this` is required, and module augmentation for typed consumers.

`extend()` performs no wrapping around the custom implementation; validation, errors, contexts, pressure, and cancellation are the extension author's responsibility. Prefer reusable `pipeline()` or `through(fn)` when global prototype mutation is unnecessary.

## Related

[`pipeline()`](/docs/reference/pipeline/), [`through()`](/docs/reference/through/), [`consume()`](/docs/reference/consume/)
