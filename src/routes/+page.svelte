<script lang="ts">
  const heroCode = `<span class="token keyword">const</span> orders <span class="token operator">=</span> <span class="token function">exstream</span>(response.body)
  .<span class="token function">json</span>(<span class="token punctuation">{</span> path<span class="token operator">:</span> <span class="token string">'$.orders[*]'</span> <span class="token punctuation">}</span>)
  .<span class="token function">mapAsync</span>(enrichOrder<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    concurrency<span class="token operator">:</span> <span class="token number">8</span>
  <span class="token punctuation">}</span>)
  .<span class="token function">filter</span>(isActive)

<span class="token keyword">await</span> orders
  .<span class="token function">jsonlStringify</span>()
  .<span class="token function">pipeTo</span>(destination)`

  const asyncCode = `<span class="token keyword">const</span> profiles <span class="token operator">=</span> users.<span class="token function">mapAsync</span>(fetchProfile<span class="token punctuation">,</span> <span class="token punctuation">{</span>
  concurrency<span class="token operator">:</span> <span class="token number">8</span><span class="token punctuation">,</span>
  ordered<span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
  retry<span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span>
  timeout<span class="token operator">:</span> <span class="token number">5_000</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span>)`

  const branchCode = `<span class="token keyword">const</span> database <span class="token operator">=</span> source.<span class="token function">fork</span>()
<span class="token keyword">const</span> audit <span class="token operator">=</span> source.<span class="token function">fork</span>()

<span class="token keyword">await</span> Promise.<span class="token function">all</span>(<span class="token punctuation">[</span>
  database.<span class="token function">pipeTo</span>(databaseWriter)<span class="token punctuation">,</span>
  audit.<span class="token function">pipeTo</span>(auditWriter)<span class="token punctuation">,</span>
<span class="token punctuation">]</span>)

<span class="token keyword">const</span> rows <span class="token operator">=</span> pageStreams.<span class="token function">merge</span>(<span class="token number">4</span><span class="token punctuation">,</span> <span class="token boolean">false</span>)`

  const operationsCode = `<span class="token keyword">const</span> groups <span class="token operator">=</span> rowsByCustomer
  .<span class="token function">sortedGroupBy</span>(<span class="token string">'customerId'</span>)

<span class="token keyword">const</span> joined <span class="token operator">=</span> <span class="token function">exstream</span>(<span class="token punctuation">[</span>customers<span class="token punctuation">,</span> orders<span class="token punctuation">]</span>)
  .<span class="token function">sortedJoin</span>(
    <span class="token string">'id'</span><span class="token punctuation">,</span>
    <span class="token string">'customerId'</span><span class="token punctuation">,</span>
    <span class="token string">'left'</span>
  )`

  const errorsCode = `<span class="token keyword">const</span> <span class="token punctuation">{</span> output<span class="token punctuation">,</span> deadLetters <span class="token punctuation">}</span> <span class="token operator">=</span>
  pipeline.<span class="token function">routeErrors</span>()

<span class="token keyword">await</span> Promise.<span class="token function">all</span>(<span class="token punctuation">[</span>
  output.<span class="token function">pipeTo</span>(destination)<span class="token punctuation">,</span>
  deadLetters.<span class="token function">pipeTo</span>(rejects)<span class="token punctuation">,</span>
<span class="token punctuation">]</span>)`
</script>

<svelte:head>
  <title>Exstream — streaming data pipelines for JavaScript</title>
  <meta
    name="description"
    content="Exstream connects JavaScript data sources, transformations, and destinations with explicit concurrency, backpressure, branching, and error handling."
  />
  <link rel="canonical" href="https://exstream-js.github.io/" />
</svelte:head>

<div class="page-frame" data-pagefind-body>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">Record-oriented streaming for JavaScript</p>
        <h1>ex<em>stream</em></h1>
        <p>
          High-level record operations with end-to-end backpressure, bounded concurrency, reliable
          branching, and explicit error handling. Exstream connects async iterables, Node.js
          streams, and Web Streams to JavaScript transforms and destinations.
        </p>
        <div class="hero-actions">
          <a class="button" href="/quick-start/">Quick start</a>
          <a class="button secondary" href="/docs/">Read the documentation</a>
        </div>
        <div class="runtime-note" aria-label="Runtime support">
          <span>Node.js 22+</span>
          <span>Modern browsers</span>
          <span>Zero runtime dependencies</span>
        </div>
      </div>

      <div class="pipeline-panel" aria-label="Example Exstream pipeline">
        <div class="panel-bar">
          <span>orders.pipeline.js</span>
          <span>source → transforms → destination</span>
        </div>
        <pre class="pipeline-code"><code>{@html heroCode}</code></pre>
        <div class="pipeline-contract" aria-label="Pipeline contract">
          <div><span>input</span><strong>pulled on demand</strong></div>
          <div><span>async processing</span><strong>8 at a time</strong></div>
          <div><span>output</span><strong>incremental JSONL</strong></div>
        </div>
      </div>
    </div>
  </section>

  <div class="topics" aria-label="Exstream capabilities">
    <section class="topic-card" id="async-processing">
      <div class="topic-copy">
        <p class="topic-index">01 / Async processing</p>
        <h2>Set the amount of work and the output order.</h2>
        <p>
          <code>mapAsync()</code> runs promise-returning transforms with an explicit concurrency limit.
          Results stay in input order by default, or can leave as soon as they complete.
        </p>
        <a class="topic-link" href="/docs/learn/async-work/">Async processing →</a>
      </div>
      <div class="topic-detail">
        <div class="topic-code"><pre><code>{@html asyncCode}</code></pre></div>
        <dl class="topic-facts">
          <div>
            <dt>Concurrency</dt>
            <dd>Finite and explicit</dd>
          </div>
          <div>
            <dt>Order</dt>
            <dd>Input or completion</dd>
          </div>
          <div>
            <dt>Failure policy</dt>
            <dd>Retry and timeout per attempt</dd>
          </div>
          <div>
            <dt>Cancellation</dt>
            <dd>Available through AbortSignal</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="topic-card" id="backpressure">
      <div class="topic-copy">
        <p class="topic-index">02 / Backpressure</p>
        <h2>Demand travels from the destination back to the source.</h2>
        <p>
          When a writer slows down, transforms stop asking for more input. Exstream propagates that
          pressure through asynchronous operators and reliable branches instead of creating an
          unbounded queue between them.
        </p>
        <a class="topic-link" href="/docs/concepts/backpressure/">Backpressure in the graph →</a>
      </div>
      <div class="topic-detail">
        <div class="pressure-path" aria-label="A slow writer reduces demand through the pipeline">
          <div><span>source</span><strong>async iterator</strong></div>
          <i aria-hidden="true">→</i>
          <div><span>transform</span><strong>mapAsync(8)</strong></div>
          <i aria-hidden="true">→</i>
          <div><span>destination</span><strong>slow writer</strong></div>
          <p><span aria-hidden="true">←</span> capacity propagates upstream</p>
        </div>
        <dl class="topic-facts">
          <div>
            <dt>Pull sources</dt>
            <dd>Pause naturally between reads</dd>
          </div>
          <div>
            <dt>Async operators</dt>
            <dd>Stop pulling when slots are full</dd>
          </div>
          <div>
            <dt>Reliable forks</dt>
            <dd>All destinations set the pace</dd>
          </div>
          <div>
            <dt>Hot sources</dt>
            <dd>Need an overflow policy</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="topic-card" id="fork-merge">
      <div class="topic-copy">
        <p class="topic-index">03 / Fork and merge</p>
        <h2>Build a graph without hiding its delivery rules.</h2>
        <p>
          <code>fork()</code> creates a reliable branch: every record must reach every active fork.
          <code>merge()</code> consumes streams with a limit on active inputs and an explicit order choice.
        </p>
        <a class="topic-link" href="/docs/learn/branching/">Branch and observe →</a>
      </div>
      <div class="topic-detail">
        <div class="topic-code"><pre><code>{@html branchCode}</code></pre></div>
        <dl class="topic-facts">
          <div>
            <dt>fork()</dt>
            <dd>Reliable, participates in pressure</dd>
          </div>
          <div>
            <dt>observe()</dt>
            <dd>Best-effort, bounded buffer</dd>
          </div>
          <div>
            <dt>merge()</dt>
            <dd>Limits active inner streams</dd>
          </div>
          <div>
            <dt>Lifecycle</dt>
            <dd>Terminal promises own completion</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="topic-card" id="streaming-operations">
      <div class="topic-copy">
        <p class="topic-index">04 / Streaming operations</p>
        <h2>Join and group records without first collecting the input.</h2>
        <p>
          Higher-level operators cover common ETL work. On pre-sorted inputs,
          <code>sortedGroupBy()</code> retains one adjacent group and <code>sortedJoin()</code>
          performs a two-stream merge join.
        </p>
        <a class="topic-link" href="/docs/reference/sorted-join/"
          >Read the sortedJoin() contract →</a
        >
      </div>
      <div class="topic-detail">
        <div class="topic-code"><pre><code>{@html operationsCode}</code></pre></div>
        <dl class="topic-facts">
          <div>
            <dt>Transform</dt>
            <dd>map, filter, batch, reduce</dd>
          </div>
          <div>
            <dt>Structure</dt>
            <dd>split, flatten, keyBy</dd>
          </div>
          <div>
            <dt>Ordered data</dt>
            <dd>sortedGroupBy, sortedJoin</dd>
          </div>
          <div>
            <dt>Formats</dt>
            <dd>CSV, JSON, JSON Lines</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="topic-card" id="error-handling">
      <div class="topic-copy">
        <p class="topic-index">05 / Error handling</p>
        <h2>Keep bad records separate from a broken pipeline.</h2>
        <p>
          Recoverable record errors can be replaced, skipped, or routed to a dead-letter stream.
          Source, destination, lifecycle, and cancellation failures remain fatal graph events and
          reject the terminal operation.
        </p>
        <a class="topic-link" href="/docs/learn/errors/">Errors and lifecycle →</a>
      </div>
      <div class="topic-detail">
        <div class="topic-code"><pre><code>{@html errorsCode}</code></pre></div>
        <dl class="topic-facts">
          <div>
            <dt>errors()</dt>
            <dd>Replace a failed record</dd>
          </div>
          <div>
            <dt>skipErrors()</dt>
            <dd>Drop accepted failures</dd>
          </div>
          <div>
            <dt>routeErrors()</dt>
            <dd>Split data and dead letters</dd>
          </div>
          <div>
            <dt>failOnError()</dt>
            <dd>Promote a record error to fatal</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>

  <section class="usage-note">
    <div>
      <p class="eyebrow">When it fits</p>
      <h2>Use Exstream when the flow has operational constraints.</h2>
    </div>
    <p>
      If the data already fits in memory and the work is sequential, an array or a
      <code>for await</code> loop is usually simpler. Exstream becomes useful when concurrency,
      backpressure, multiple destinations, or error routing need to behave as one pipeline.
      <a href="/docs/project/when-not-to-use/">See the tradeoffs →</a>
    </p>
  </section>
</div>
