---
playground: backpressure
---

<svelte:head>
  <title>Backpressure — Exstream</title>
  <meta name="description" content="Understand backpressure in plain language, find common pipeline bottlenecks, and handle reliable forks and hot event sources safely." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/backpressure/" />
</svelte:head>

<p class="eyebrow">Learn · Flow control</p>

# Backpressure

<p class="lead">When one step is slower than the step before it, the faster step must wait. That waiting signal is backpressure.</p>

## Why it matters

Imagine a source producing 1,000 records per second and a database writing 100. The extra 900 records per second have only three places to go:

1. stay in memory;
2. be dropped;
3. make the source wait.

For records that must not be lost, the third answer is normally the right one. The database says “I am full,” that signal travels backwards through the pipeline, and the source stops pulling until there is room again.

```text
source → transform → writer
   ↑                   │
   └────── wait ───────┘
```

Without backpressure, a temporary slowdown becomes a growing queue and eventually a memory problem. Backpressure does not make the slow step faster. It prevents faster steps from running away from it.

## Exstream respects backpressure

An Exstream pipeline pulls data only when downstream has capacity. The signal crosses synchronous transforms, `mapAsync()`, reliable forks, Node streams, Web Streams, async iterators, and destinations created with `pipeTo()`.

In practice, if a writer slows down:

- completed outputs stop being accepted;
- bounded asynchronous windows fill up;
- upstream stops pulling new inputs;
- a compatible source pauses or waits for the next request.

You normally do not pause and resume the pipeline yourself. Each operator owns a bounded amount of work, and Exstream coordinates demand between them.

## Where pipelines usually slow down

| Bottleneck             | What happens                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Slow source            | Downstream waits because there is no input yet. There is nothing to push back: the source already sets the pace.            |
| `mapAsync()`           | Once its `concurrency` slots are occupied, it stops requesting records until a result is accepted downstream.               |
| Slow writer            | Its write promise or native stream capacity makes pressure travel all the way back toward the source.                       |
| CPU-intensive callback | A long synchronous `map()` blocks the JavaScript thread. Backpressure limits queued records, but it cannot unblock the CPU. |

For CPU-heavy work, use smaller chunks, yield periodically, or move the computation to worker threads. Increasing `mapAsync()` concurrency does not make synchronous JavaScript run in parallel.

`mapAsync()` deserves one detail: its window includes both callbacks still running and completed results waiting for downstream. With `concurrency: 8`, the operator owns at most eight such records. `ordered: true` may keep a fast later result waiting behind a slow earlier one, but the window remains bounded.

## A slow fork slows every reliable fork

`fork()` means reliable delivery. The shared source advances only when every attached reliable branch can accept the next record:

```javascript
const orders = exstream(source, { start: 'manual' })
const database = orders.fork().pipeTo(databaseWriter)
const audit = orders.fork().pipeTo(slowAuditWriter)

orders.start()
await Promise.all([database, audit])
```

If `slowAuditWriter` accepts 10 records per second, the shared source cannot safely feed the database branch at 1,000 records per second. Otherwise records needed by the audit branch would accumulate without a bound.

Use `observe()` for metrics, sampling, or diagnostics that must never slow the reliable flow. An observer has a finite buffer and an explicit overflow policy, so it may drop data. That trade-off is exactly why it is not a reliable fork.

## Sources that can wait and sources that cannot

Pull-based sources naturally respect backpressure:

- iterables and async iterables produce the next value when Exstream asks;
- Node readable streams can pause;
- Web readable streams expose demand through their reader.

A **hot source** produces events independently of downstream demand. Mouse movement, browser events, some sockets, and many `EventEmitter` sources cannot be told to replay an event later. Exstream cannot invent backpressure that the original source does not support.

For a hot source, choose a finite `highWaterMark` and decide what happens when it fills: drop the oldest event, drop the newest, or fail. If every event must survive, use a durable queue or broker at that boundary.

## Use `throttle()` when intermediate events do not matter

Mouse movement is a sensible use of `throttle()`: a UI preview or analytics counter rarely needs hundreds of positions per second.

```javascript
const mouseMoves = exstream
  .fromEvent(window, 'mousemove', {
    map: (event) => ({ x: event.clientX, y: event.clientY }),
    highWaterMark: 1,
    overflow: 'drop-oldest',
  })
  .throttle(200)

await mouseMoves.pipeTo(renderPointerPreview)
```

The first position is emitted immediately. Positions arriving during the next 200 milliseconds are dropped, not delayed. The result is at most five updates per second with constant operator memory.

This is not backpressure on the browser: the mouse keeps producing events. `throttle()` is the explicit decision that intermediate values are disposable. Use `ratelimit()` instead when every value must be retained and the source is capable of slowing down.

Open the playground, press **Run**, then move the pointer anywhere over the page. Remove `throttle(200)` to compare the number of events reaching the destination. The event stream is open-ended, so press **Stop** when finished.

## Four questions are usually enough

Before shipping a pipeline, identify:

1. the slowest stage;
2. the bound on every asynchronous window or buffer;
3. whether every fork must be reliable;
4. whether the source can actually pause.

If a buffer is unbounded, or a hot source may produce indispensable events faster than they can be stored, the boundary needs redesigning.

Continue with [Fork and observe](/docs/learn/branching/), [`mapAsync()`](/docs/reference/map-async/), [`throttle()`](/docs/reference/throttle/), and [`ratelimit()`](/docs/reference/ratelimit/).
