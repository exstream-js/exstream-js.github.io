<script>
  import PlaygroundLink from '$lib/components/PlaygroundLink.svelte'
</script>

<svelte:head>
  <title>Pipeline model — Exstream</title>
  <meta name="description" content="How Exstream reads, converts, merges, transforms, branches, and writes streaming data." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/learn/pipeline-model/" />
</svelte:head>

<p class="eyebrow">Learn</p>

# Pipeline model

Exstream transforms and dispatches data while it is being read. A pipeline takes data from one or more sources, optionally converts or combines it, applies transformations, and sends the resulting records to one or more destinations.

```text
sources → conversion → merge → transformations → fork → destinations
```

Most pipelines use only some of these stages. The important part is that they form one connected flow: data moves downstream and demand from destinations moves upstream.

## Sources

A source is the data you already have. Practical examples include:

- a CSV file opened with a Node.js readable stream;
- the JSON Lines body of an HTTP response;
- an async iterable that follows the pages of an API;
- a Web `ReadableStream` from a browser upload;
- an array of records used by a script or test.

```javascript
import { createReadStream } from 'node:fs'

const orderFile = exstream(createReadStream('orders.csv'))

const response = await fetch('/events.jsonl')
const eventBody = exstream(response.body)

const ordersFromApi = exstream(fetchOrderPages())
```

Read [Create a source](/docs/learn/sources/) for the supported inputs and how each one is read and cancelled.

## Data conversion

Files and response bodies usually produce byte or text chunks rather than application records. Format operators convert those chunks incrementally:

```javascript
const orders = orderFile.csv({ header: true })
const events = eventBody.jsonl()
```

The rest of the pipeline receives one parsed order or event at a time. Output operators such as `csvStringify()` and `jsonlStringify()` perform the inverse conversion before a file or network destination.

See the [format operators](/docs/reference/#formats) for CSV, JSON, JSON Lines, text splitting, and their output equivalents.

## Merging sources

Several sources can become one flow. For example, orders from a website and retail stores can be processed by the same pipeline:

```javascript
const orders = exstream([webOrders, retailOrders]).merge(2, false)
```

The merged output is another Exstream, so downstream operators do not need to know which source produced a record.

Read the [`merge()` reference](/docs/reference/merge/) for parallelism, ordering, lazy source factories, buffering, and errors.

## Transforming records

Transformations describe the work to perform on each record. They can remove cancelled orders, normalize fields, enrich records through an API with bounded concurrency, group sorted input without collecting it all, or prepare batches for a database:

```javascript
const processedOrders = orders
  .filter((order) => order.status === 'paid')
  .map((order) => ({
    ...order,
    amountInCents: Math.round(order.amount * 100),
  }))
  .mapAsync(
    async (order) => ({
      ...order,
      customer: await loadCustomerProfile(order.customerId),
    }),
    { concurrency: 8, ordered: true },
  )
```

Operators such as `filter()`, `map()`, `mapAsync()`, `batch()`, `sortedGroupBy()`, and `sortedJoin()` cover common record-processing work. They can be combined without changing how the source or destination is connected.

Continue with [Transform data](/docs/learn/transform-data/) for synchronous operators and [Async processing](/docs/learn/async-work/) for controlled asynchronous work.

## Branching

A flow can be forked when the same processed records need more than one destination. Each reliable fork is its own pipeline branch and can apply branch-specific transformations:

```javascript
const database = processedOrders.fork()
const archive = processedOrders.fork()
```

Each branch ends at a terminal consumer. A reliable branch participates in backpressure; an observer is used when a secondary branch must not slow the main flow.

Read [Branch and observe](/docs/learn/branching/) for reliable forks, non-blocking observers, and their different delivery guarantees.

## Destinations

A destination is where a branch is consumed. Common examples are Node writable streams, Web `WritableStream` instances, database or queue writers, files, and application code using `for await`:

```javascript
import { createWriteStream } from 'node:fs'

await Promise.all([
  database.batch(100).pipeTo(databaseWriter),
  archive.jsonlStringify().pipeTo(createWriteStream('processed-orders.jsonl')),
])
```

Terminal methods such as `pipeTo()`, `drain()`, `toArray()`, and async iteration start the flow and report its completion.

Read [Consume a pipeline](/docs/learn/consume/) for the available terminal consumers and destination adapters.

## When work starts

Building the chain does not read anything. Exstream pipelines are lazy; work begins when a terminal consumer asks for data:

```javascript
const activeOrders = exstream(source)
  .map(normalizeOrder)
  .filter((order) => order.active)

await activeOrders.pipeTo(destination)
```

As the destination accepts records, the pipeline requests more data upstream. If the destination slows down, that pressure travels back through the operators toward the source. Operators process incrementally unless their job explicitly requires collection, as sorting does.

Read [Backpressure](/docs/concepts/backpressure/) for how demand and bounded buffering behave across a connected pipeline.

<PlaygroundLink example="pipeline-model" />
