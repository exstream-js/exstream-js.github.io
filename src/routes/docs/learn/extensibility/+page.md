<svelte:head>
  <title>Extensibility and composition — Exstream</title>
  <meta name="description" content="Build reusable Exstream pipelines and custom operators with through(), consumeSync(), and consume()." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/extensibility/" />
</svelte:head>

<p class="eyebrow">Learn · Composition</p>

# Extensibility and composition

<p class="lead">In Exstream, an extension is an ordinary function from one stream to another. It stays local, composes with <code>through()</code>, and can use the same public primitives as the built-in operators.</p>

## One extension model

A custom operator does not need registration or prototype mutation. Write a function that receives an Exstream and returns the transformed Exstream:

```javascript
const multiply = (factor) => (stream) => stream.map((value) => value * factor)

const totalsInCents = totals.through(multiply(100))
```

`through()` calls the function with the current stream and returns its result. It adds no queue, scheduler, error boundary, or lifecycle of its own, so the operator's normal backpressure and cancellation behavior stays visible.

This makes extensions ordinary JavaScript modules:

```javascript
// order-operators.js
export const paidOnly = (stream) => stream.filter((order) => order.status === 'paid')

export const enrichCustomers = (loadCustomer) => (stream) =>
  stream.mapAsync(async (order) => ({ ...order, customer: await loadCustomer(order.customerId) }), {
    concurrency: 8,
  })
```

Callers import only what they use, and two libraries cannot overwrite each other's methods.

## Reusable pipelines

Use `pipeline()` when a reusable piece is made entirely from existing operators:

```javascript
const normalizeOrder = exstream
  .pipeline()
  .filter((order) => order.total != null)
  .map((order) => ({ ...order, total: Number(order.total) }))

const fromApi = exstream(apiOrders).through(normalizeOrder)
const fromFile = exstream(csvRows).through(normalizeOrder)
```

The pipeline is a recipe, not a live stream. Every attachment creates fresh operator state, so the same definition can safely be reused.

Functions and pipelines compose through the same method:

```javascript
const prepareOrders = exstream
  .pipeline()
  .through(paidOnly)
  .through(normalizeOrder)
  .through(enrichCustomers(loadCustomer))

await exstream(orders).through(prepareOrders).pipeTo(orderWriter)
```

Choose the smallest abstraction that expresses the behavior:

| Goal                                     | Primitive              |
| ---------------------------------------- | ---------------------- |
| Reuse a chain of existing operators      | `pipeline()`           |
| Package or parameterize a transformation | function + `through()` |
| Transform each input synchronously       | `consumeSync()`        |
| Delay when the next input may arrive     | `consume()`            |
| Package terminal behavior                | `destination()`        |

## Build a synchronous operator with `consumeSync()`

`consumeSync()` exposes Exstream's record protocol directly. The callback receives either a value, a record error, or `exstream.nil`, and must explicitly emit what should continue downstream.

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

The three protocol cases matter. Dropping the error branch silently loses record errors. Failing to push `exstream.nil` leaves downstream open forever.

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

Call `next()` exactly once for every non-terminal input, and only when the operator is ready for another one. Returning a promise does not release upstream; `next()` is the progress signal. Do not call it after `exstream.nil`. Downstream backpressure still wins: `next()` releases this operator's hold, but cannot force a paused destination to accept more data.

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

A well-behaved reusable operator:

- returns an Exstream and does not start terminal consumption internally;
- preserves or deliberately transforms errors and record context;
- keeps retained state bounded and lets backpressure travel upstream;
- cleans up timers, listeners, and external resources when its output ends;
- leaves terminal choice, forks, observation, and cancellation to the caller.

Prefer a built-in operator when it already expresses the behavior. `consume()` and `consumeSync()` are intentionally low-level: they make new behavior possible, but validation, protocol forwarding, errors, context, and cleanup become the extension author's responsibility.

## Related

[`through()`](/docs/reference/through/), [`pipeline()`](/docs/reference/pipeline/), [`consumeSync()`](/docs/reference/consume-sync/), [`consume()`](/docs/reference/consume/), [`destination()`](/docs/reference/destination/)
