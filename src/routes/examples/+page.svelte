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
        Examples are guided browser labs, not a wall of snippets. Each lesson starts with a problem,
        runs real Exstream code, and makes flow, buffering, and output visible.
      </p>
      <div class="examples-actions">
        <a class="button" href="/examples/playground/">Open the playground</a>
      </div>
    </div>

    <div class="tutorial-preview" aria-label="Interactive tutorial sequence">
      <div class="tutorial-preview-bar">
        <span>Learning path</span>
        <span>runs client-side</span>
      </div>
      <ol>
        <li>
          <a href="/examples/playground/?example=sources">
            <span class="tutorial-number">01</span><strong>Create a source</strong><small
              >pull an infinite async generator</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=transform-data">
            <span class="tutorial-number">02</span><strong>Transform records</strong><small
              >map, filter, batch, and inspect output</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=async-work">
            <span class="tutorial-number">03</span><strong>Enrich concurrently</strong><small
              >bound work and choose output order</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=backpressure">
            <span class="tutorial-number">04</span><strong>Control backpressure</strong><small
              >slow the sink and watch demand</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=branching">
            <span class="tutorial-number">05</span><strong>Fork the flow</strong><small
              >coordinate reliable destinations</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=errors">
            <span class="tutorial-number">06</span><strong>Handle bad records</strong><small
              >route retries and dead letters</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
        <li>
          <a href="/examples/playground/?example=merge-sources">
            <span class="tutorial-number">07</span><strong>Merge sources</strong><small
              >parallel inputs and output order</small
            ><span class="tutorial-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      </ol>
      <p>Every lesson combines explanation, editable code, Run / Stop / Reset, and live output.</p>
    </div>
  </section>
</div>
