---
playground: extensibility
---

<svelte:head>
  <title>Extensibility — Exstream</title>
  <meta name="description" content="Build custom Exstream operators with consumeSync() and consume(), including protocol records, backpressure, context, and cleanup." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/extensibility/" />
</svelte:head>

<p class="eyebrow">Learn · Advanced</p>

# Extensibility

<p class="lead">When existing operators cannot express a transformation, <code>consumeSync()</code> and <code>consume()</code> expose Exstream's record protocol so you can implement a new one.</p>

This is the lowest-level part of the public transformation API. Before using it, prefer combining built-ins into an operator function or reusable pipeline as described in [Composition](/docs/learn/composition/). The result of a custom operator is still an ordinary `stream => stream` function attached with `through()`:

```javascript
const customOperator = (options) => (source) => {
  // Return a new Exstream built from source.
}

const output = input.through(customOperator(options))
```

Choose the consumer according to when the operator can accept another input:

| Primitive       | Use it when                                                  |
| --------------- | ------------------------------------------------------------ |
| `consumeSync()` | every input is handled completely during the callback        |
| `consume()`     | the operator may delay before it is ready for the next input |

## Build a synchronous operator with `consumeSync()`

`consumeSync()` exposes three protocol cases. Each callback receives either a value, a record error, or `exstream.nil`, and must explicitly emit what should continue downstream.

Here is a deliberately small implementation of `map()`:

```javascript
const mapSimple = (project) => (source) =>
  source.consumeSync((error, value, push) => {
    if (error) {
      push(error)
      return
    }

    if (value === exstream.nil) {
      push(null, exstream.nil)
      return
    }

    try {
      push(null, project(value))
    } catch (error) {
      push(error)
    }
  })

const labels = exstream(products).through(mapSimple((product) => product.label))
```

There is no `next()` because this consumer cannot hold upstream: after the callback returns, the source may deliver another record. Use it for synchronous transformations, validation, parsing, or state machines. A production operator may also add richer error provenance and context behavior; the built-in `map()` already does that work.

All three protocol cases matter. Dropping the error branch silently loses record errors. Failing to push `exstream.nil` leaves downstream open forever.

## Control progress with `consume()`

`consume()` adds `next()`. Exstream does not ask upstream for another record until the callback calls it, which allows an operator to retain one record across asynchronous work:

```javascript
const delayEach = (milliseconds) => (source) =>
  source.consume((error, value, push, next) => {
    if (error) {
      push(error)
      next()
      return
    }

    if (value === exstream.nil) {
      push(null, exstream.nil)
      return
    }

    setTimeout(() => {
      push(null, value)
      next()
    }, milliseconds)
  })
```

Call `next()` exactly once for every non-terminal input, and only when the operator is ready for another one. Returning a promise does not release upstream; `next()` is the progress signal. Do not call it after `exstream.nil`.

Downstream backpressure still wins. `next()` releases this operator's internal hold, but it cannot force a paused destination to accept more data.

## Example: batch by time or count

Some operators need both synchronous state and asynchronous release. This simplified batching operator emits when it has collected `count` records or when the oldest pending record has waited `milliseconds`:

```javascript
const batchWithTimeOrCount = ({ count, milliseconds }) => {
  if (!Number.isInteger(count) || count < 1) throw new TypeError('count must be positive')
  if (!Number.isFinite(milliseconds) || milliseconds < 0) {
    throw new TypeError('milliseconds must be non-negative')
  }

  return (source) => {
    let batch = []
    let emitBatch
    let timer

    const clearTimer = () => {
      if (timer !== undefined) clearTimeout(timer)
      timer = undefined
    }

    const flush = () => {
      if (batch.length === 0) return

      clearTimer()
      const values = batch
      const push = emitBatch
      batch = []
      emitBatch = undefined
      push(null, values)
    }

    const output = source.consume((error, value, push, next) => {
      if (error) {
        push(error)
        next()
        return
      }

      if (value === exstream.nil) {
        flush()
        push(null, exstream.nil)
        return
      }

      if (batch.length === 0) {
        emitBatch = push
        timer = setTimeout(flush, milliseconds)
      }

      batch.push(value)
      if (batch.length >= count) flush()
      next()
    })

    output.once('end', clearTimer)
    return output
  }
}

const batches = events.through(batchWithTimeOrCount({ count: 100, milliseconds: 250 }))
```

The pending array is bounded by `count`. After a batch is emitted, downstream pressure can pause new input. The timer is cleared when the output ends, and because `emitBatch` comes from the first record, a timed batch inherits that record's context. An application-specific operator can instead pass an explicit aggregate context as the third argument to `push()`.

This example is intentionally compact. A library-grade version may define clock injection for tests, timer drift behavior, structured option errors, context aggregation, and a precise cancellation policy.

## Boundaries and conventions

A well-behaved custom operator:

- returns an Exstream and does not start terminal consumption internally;
- preserves or deliberately transforms errors and record context;
- keeps retained state bounded and lets backpressure travel upstream;
- cleans up timers, listeners, and external resources when its output ends;
- leaves terminal choice, forks, observation, and cancellation to the caller.

`consume()` and `consumeSync()` deliberately expose more responsibility than ordinary operators. Validation, protocol forwarding, errors, context, and cleanup all become part of the custom operator's contract. That is why extensibility comes last: these primitives make more sense after the graph, lifecycle, backpressure, and error model are familiar.

## Related

[Composition](/docs/learn/composition/), [`through()`](/docs/reference/through/), [`consumeSync()`](/docs/reference/consume-sync/), [`consume()`](/docs/reference/consume/)
