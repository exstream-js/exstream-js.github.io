<svelte:head>
  <title>Examples — Exstream</title>
  <meta
    name="description"
    content="Learn Exstream through progressive, browser-native pipeline tutorials."
  />
  <link rel="canonical" href="https://exstream-js.github.io/examples/" />
</svelte:head>

<div data-pagefind-body>
  <section class="examples-landing page-frame">
    <div class="examples-copy">
      <p class="eyebrow">Learn by running</p>
      <h1>See the pipeline make decisions.</h1>
      <p class="lead">
        Examples will be guided browser labs, not a wall of snippets. Each lesson starts with a
        problem, runs real Exstream code, and makes flow, buffering, and output visible.
      </p>
      <div class="examples-actions">
        <a class="button" href="/docs/examples/browser-csv/">Run the browser CSV guide</a>
        <span>The first complete demo remains in Docs while the tutorial workspace is built.</span>
      </div>
    </div>

    <div class="tutorial-preview" aria-label="Planned interactive tutorial sequence">
      <div class="tutorial-preview-bar">
        <span>Learning path</span>
        <span>runs client-side</span>
      </div>
      <ol>
        <li>
          <span>01</span><strong>Transform records</strong><small
            >map, filter, and inspect output</small
          >
        </li>
        <li>
          <span>02</span><strong>Parse a remote CSV</strong><small>fetch and stream rows</small>
        </li>
        <li>
          <span>03</span><strong>Enrich concurrently</strong><small
            >bound work and preserve order</small
          >
        </li>
        <li>
          <span>04</span><strong>Control backpressure</strong><small
            >slow the sink and watch demand</small
          >
        </li>
        <li>
          <span>05</span><strong>Fork the flow</strong><small
            >database, file, and audit outputs</small
          >
        </li>
        <li>
          <span>06</span><strong>Handle bad records</strong><small>route, skip, or fail</small>
        </li>
        <li>
          <span>07</span><strong>Merge sources</strong><small>parallelism and output order</small>
        </li>
        <li>
          <span>08</span><strong>Build for the browser</strong><small
            >Web Streams and cancellation</small
          >
        </li>
      </ol>
      <p>
        Every lesson will combine explanation, editable code, Run / Stop / Reset, and live output.
      </p>
    </div>
  </section>

  <section class="examples-method page-frame">
    <div>
      <p class="eyebrow">Tutorial contract</p>
      <h2>Change one variable. See one consequence.</h2>
    </div>
    <div class="examples-method-grid">
      <article>
        <span>Problem</span>
        <p>Begin with a concrete ETL failure mode, not an API name.</p>
      </article>
      <article>
        <span>Code</span>
        <p>Run the same package shipped to applications, isolated in the browser.</p>
      </article>
      <article>
        <span>Flow</span>
        <p>Show which records are active, waiting, emitted, dropped, or cancelled.</p>
      </article>
      <article>
        <span>Why</span>
        <p>Connect the observed behavior to the relevant concept and API contract.</p>
      </article>
    </div>
  </section>
</div>
