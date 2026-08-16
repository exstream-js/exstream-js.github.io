<script lang="ts">
  const heroCode = `<span class="token keyword">const</span> orders <span class="token operator">=</span> <span class="token function">exstream</span>(response.body)
  .<span class="token function">json</span>(<span class="token punctuation">{</span> path<span class="token operator">:</span> <span class="token string">'$.orders[*]'</span> <span class="token punctuation">}</span>)
  .<span class="token function">mapAsync</span>(enrich<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    concurrency<span class="token operator">:</span> <span class="token number">16</span><span class="token punctuation">,</span>
    ordered<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span>)
  .<span class="token function">filter</span>(isActive)`

  const recipeCode = `<span class="token keyword">import</span> exstream <span class="token keyword">from</span> <span class="token string">'exstream.js'</span>

<span class="token keyword">await</span> <span class="token function">exstream</span>(csvChunks)
  .<span class="token function">csv</span>(<span class="token punctuation">{</span> header<span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span>)
  .<span class="token function">mapAsync</span>(loadCustomer<span class="token punctuation">,</span> <span class="token punctuation">{</span>
    concurrency<span class="token operator">:</span> <span class="token number">8</span><span class="token punctuation">,</span>
    ordered<span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
  <span class="token punctuation">}</span>)
  .<span class="token function">filter</span>((<span class="token punctuation">{</span> customer <span class="token punctuation">}</span>) <span class="token operator">=&gt;</span> customer.active)
  .<span class="token function">jsonlStringify</span>()
  .<span class="token function">pipeTo</span>(output)`
</script>

<svelte:head>
  <title>Exstream — composable streaming ETL for JavaScript</title>
  <link rel="canonical" href="https://exstream-js.github.io/" />
</svelte:head>

<div class="page-frame" data-pagefind-body>
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <p class="eyebrow">Streaming ETL for JavaScript</p>
        <h1>Stream millions. <em>Stay bounded.</em></h1>
        <p>
          Connect large data sources to JavaScript transforms and one or more destinations. Exstream
          keeps memory, asynchronous work, failure, and cancellation under control across the whole
          pipeline.
        </p>
        <div class="hero-actions">
          <a class="button" href="/quick-start/">Build your first pipeline</a>
          <a class="button secondary" href="https://github.com/micheletriaca/exstream"
            >View on GitHub</a
          >
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
          <span class="live-dot">bounded flow</span>
        </div>
        <pre class="pipeline-code"><code>{@html heroCode}</code></pre>
        <div
          class="flow-graph"
          aria-label="Source flows through map and asynchronous enrichment, then forks to database and audit outputs"
        >
          <span class="flow-line" aria-hidden="true"></span>
          <span class="packet" aria-hidden="true"></span>
          <span class="packet second" aria-hidden="true"></span>
          <span class="packet third" aria-hidden="true"></span>
          <div class="flow-node"><span>source</span><strong>iterator</strong></div>
          <div class="flow-node"><span>transform</span><strong>map</strong></div>
          <div class="flow-node"><span>concurrency 16</span><strong>mapAsync</strong></div>
          <div class="flow-node output"><strong>database</strong><strong>audit</strong></div>
        </div>
      </div>
    </div>
  </section>

  <section class="section dark-section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="eyebrow">The core difference</p>
          <h2>A slow destination does not become a memory leak.</h2>
        </div>
        <div>
          <p>
            When a writer cannot keep up, demand travels back through every transform to the source.
            Records wait where you set a bound instead of accumulating in an invisible queue.
          </p>
        </div>
      </div>
      <div class="principles-grid">
        <article class="principle">
          <span class="number">01 / PRESSURE</span>
          <h3>Bounded by design</h3>
          <p>The source pulls the next record only when the reliable destinations can accept it.</p>
        </article>
        <article class="principle">
          <span class="number">02 / WORK</span>
          <h3>Concurrency you can name</h3>
          <p>Choose how many requests run at once and whether their results must stay ordered.</p>
        </article>
        <article class="principle">
          <span class="number">03 / GRAPH</span>
          <h3>Fan-out that finishes</h3>
          <p>Send the same flow to multiple writers and know which branches may slow or stop it.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="eyebrow">What it does</p>
          <h2>Operations for real record flows.</h2>
        </div>
        <div>
          <p>
            Exstream is a record-oriented pipeline for backend JavaScript and browser runtimes. It
            becomes useful when a loop starts growing its own queues, worker pools, branches, and
            cleanup rules.
          </p>
        </div>
      </div>
      <div class="capabilities-grid">
        <article>
          <span>Transform</span>
          <h3>Shape data as it arrives.</h3>
          <p>
            Map, filter, batch, group, reduce, and compose reusable pipelines without collecting the
            source.
          </p>
        </article>
        <article>
          <span>Coordinate</span>
          <h3>Bound asynchronous I/O.</h3>
          <p>
            Run enrichment concurrently with explicit order, retry, timeout, and cancellation
            behavior.
          </p>
        </article>
        <article>
          <span>Branch</span>
          <h3>Fork, observe, and merge flows.</h3>
          <p>
            Choose reliable branches for required data and non-blocking observers for metrics or
            sampling.
          </p>
        </article>
        <article>
          <span>Encode</span>
          <h3>Stream CSV, JSON, and JSON Lines.</h3>
          <p>
            Parse and serialize large inputs incrementally with explicit limits for records, values,
            and depth.
          </p>
        </article>
      </div>
    </div>
  </section>

  <section class="section pt-0">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="eyebrow">A real recipe</p>
          <h2>CSV in. Enriched JSON Lines out.</h2>
        </div>
        <div>
          <p>
            Parse records incrementally, keep eight lookups in flight, preserve input order, and
            wait until the destination has really finished.
          </p>
        </div>
      </div>

      <div class="recipe-grid">
        <div class="code-card">
          <pre><code>{@html recipeCode}</code></pre>
        </div>
        <aside class="truth-card">
          <p class="eyebrow">Operator contract</p>
          <h3>No hidden semantics.</h3>
          <p>
            Every reference page documents the behavior an ETL job depends on—not just the happy
            path.
          </p>
          <dl>
            <div>
              <dt>Backpressure</dt>
              <dd>end to end</dd>
            </div>
            <div>
              <dt>Concurrency</dt>
              <dd>8 records</dd>
            </div>
            <div>
              <dt>Order</dt>
              <dd>preserved</dd>
            </div>
            <div>
              <dt>Cancellation</dt>
              <dd>AbortSignal</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  </section>

  <section class="section pt-0">
    <div class="section-inner">
      <div class="quick-cta">
        <div>
          <p class="eyebrow">Five-minute start</p>
          <h2>Turn a CSV into a bounded pipeline.</h2>
          <p>Choose Node.js or browser, JavaScript or TypeScript, and get a real result.</p>
        </div>
        <div>
          <div class="install-command"><span>$</span> npm install exstream.js</div>
          <a class="button mt-3 w-full" href="/quick-start/">Open quick start →</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section pt-0">
    <div class="section-inner">
      <div class="section-heading">
        <div>
          <p class="eyebrow">The honest boundary</p>
          <h2>Sometimes a loop is the better tool.</h2>
        </div>
        <div>
          <p>
            If your data already fits in memory, native array methods or a small
            <code>for await</code> loop are usually clearer. Exstream earns its place when bounded memory,
            concurrent I/O, fan-out, and cleanup become one system problem.
          </p>
          <a class="button secondary mt-6" href="/docs/project/when-not-to-use/"
            >See the tradeoffs</a
          >
        </div>
      </div>
    </div>
  </section>
</div>
