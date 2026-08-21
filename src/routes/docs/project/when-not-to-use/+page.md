<svelte:head>
  <title>When to use Exstream</title>
  <meta name="description" content="Decide when Exstream solves a real pipeline problem and when a simpler JavaScript tool is clearer." />
  <link rel="canonical" href="https://exstream-js.github.io/docs/project/when-not-to-use/" />
</svelte:head>

<p class="eyebrow">Overview · Scope</p>

# When to use Exstream

<p class="lead">Use Exstream when a data flow needs explicit operational behavior, advanced error handling, or one high-level API across Node.js and modern browsers.</p>

## Choose Exstream when coordination matters

Exstream is a strong choice when several of these are true:

- the input may be large or unbounded and processing must remain incremental;
- asynchronous I/O needs bounded concurrency and explicit output order;
- slow destinations must control how quickly the source produces more data;
- several destinations need defined delivery guarantees;
- retries, timeouts, recovery, dead letters, and fatal failures need distinct policies;
- cancellation and cleanup must cover the complete flow;
- one uniform API should connect iterables, Node streams, and Web Streams across Node.js and the browser;
- high-level record operations are preferable to stream plumbing.

The syntax matters: it keeps sophisticated pipelines readable, composable, and easier to review. The deeper value is that flow control, error policy, and lifecycle semantics travel with the same API.

## A simpler or more specialized tool may fit better

Start with the platform when several of these are true:

- the complete dataset comfortably fits in memory;
- the flow has one source, a few transformations, and one destination;
- sequential `await`s provide enough throughput;
- an existing Node.js or Web Streams pipeline already expresses the required behavior;
- a uniform API across runtimes is not important;
- ordinary `try`/`catch` provides the required error policy;
- you would not otherwise need coordination infrastructure.

If those conditions describe the job, arrays, async iteration, or native streams will usually be clearer.

Some workloads need a different category of tool altogether. DuckDB, Polars, and Arrow are often better for large analytical joins, aggregations, scans, and columnar computation. If a hot source cannot pause and losing events is unacceptable, use a durable queue or broker at that boundary.

If the alternative is a loop, use the loop. If it is a concurrency pool, ordering queue, retry policy, fan-out coordinator, cancellation graph, or cleanup protocol, Exstream has probably earned its place.
