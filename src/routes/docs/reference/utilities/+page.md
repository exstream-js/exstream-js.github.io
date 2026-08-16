<svelte:head><title>Utilities — Exstream</title><meta name="description" content="Reference for Exstream's exported guards, path helpers, numeric validators, currying helpers, and runtime predicates." /><link rel="canonical" href="https://exstream-js.github.io/docs/reference/utilities/" /></svelte:head>

<p class="eyebrow">API · Core</p>

# Utilities

<p class="lead">Small exported helpers used by Exstream operators and available to extensions.</p>

## Guards

| Function                    | Result                                                 |
| --------------------------- | ------------------------------------------------------ |
| `isExstream(value)`         | Type guard for Exstream instances                      |
| `isExstreamPipeline(value)` | Type guard for reusable pipelines                      |
| `isDefined(value)`          | False only for `null` and `undefined`                  |
| `has(value, property)`      | True for an own property on a defined value            |
| `isIterable(value)`         | Has callable `Symbol.iterator`                         |
| `isAsyncIterable(value)`    | Has callable `Symbol.asyncIterator`                    |
| `isPromise(value)`          | Native `Promise` instance; generic thenables are false |
| `isFunction(value)`         | `typeof value === 'function'`                          |
| `isString(value)`           | Primitive string guard                                 |
| `isError(value)`            | `instanceof Error`                                     |
| `isNodeStream(value)`       | Runtime Node-stream shape guard                        |

## Values and paths

```typescript
get(object, fieldPath, defaultValue?)
makeGetter(fieldPath, defaultValue?)
splitFieldPath(path): string[]
traverse(value, pathParts, defaultValue?, index?): unknown
```

Paths support dot and bracket notation. Traversal follows own properties only and returns the default when a segment is missing or the current value is nullish. Quotes inside bracket syntax are stripped; this is a lightweight field-path parser, not JSONPath.

## Validation and functions

| Function                                          | Contract                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------- |
| `asPositiveInteger(value, allowInfinity = false)` | Coerces with `Number`; returns the positive integer/Infinity or `null` |
| `asNonNegativeFiniteNumber(value)`                | Coerces with `Number`; returns a finite number ≥ 0 or `null`           |
| `escapeRegExp(text)`                              | Escapes regex-significant and whitespace characters                    |
| `partial(fn, ...args)`                            | Prepends arguments while preserving call-time `this`                   |
| `ncurry(count, fn, ...args)`                      | Curries until `count` arguments, then ignores extras beyond that count |
| `curry(fn, ...args)`                              | Uses `fn.length` as the curry count                                    |

These helpers are public but low-level. Application code can use standard platform/library equivalents when their edge-case semantics are preferable.

## Related

[`extend()`](/docs/reference/extend/), [`pluck()`](/docs/reference/pluck/), [`stream state`](/docs/reference/stream-state/)
