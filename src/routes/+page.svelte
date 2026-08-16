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
        <h1>Move records, <em>not limits.</em></h1>
        <p>
          Build bounded, concurrent data pipelines without reimplementing backpressure, fan-out,
          cancellation, and cleanup every time.
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
          <h2>The whole graph slows down together.</h2>
        </div>
        <div>
          <p>
            A slow writer propagates pressure through every transform to the source. Async work
            stays inside the concurrency bound. Cancellation reaches work that is no longer useful.
          </p>
        </div>
      </div>
      <div class="principles-grid">
        <article class="principle">
          <span class="number">01 / PRESSURE</span>
          <h3>Bounded by design</h3>
          <p>Sources pull only as fast as the slowest reliable consumer can accept records.</p>
        </article>
        <article class="principle">
          <span class="number">02 / WORK</span>
          <h3>Concurrency you can name</h3>
          <p>Ordering, retries, timeouts, and parallel work are explicit operator contracts.</p>
        </article>
        <article class="principle">
          <span class="number">03 / GRAPH</span>
          <h3>Fan-out that finishes</h3>
          <p>
            Reliable branches, observers, errors, and cancellation follow the complete pipeline.
          </p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
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
          <h2>Start with one useful pipeline.</h2>
          <p>No framework, service, or account required.</p>
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
