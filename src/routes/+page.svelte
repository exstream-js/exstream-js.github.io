<script lang="ts">
  import Play from '@lucide/svelte/icons/play'
  import type { PageProps } from './$types'

  let { data }: PageProps = $props()
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
          <div class="panel-bar-actions">
            <span>source → transforms → destination</span>
            <a
              class="hero-play-button"
              href="/examples/playground/?example=orders-pipeline"
              aria-label="Open this orders pipeline in the playground"
              title="Open in playground"
            >
              <Play size={15} strokeWidth={2.2} fill="currentColor" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div class="code-block-shell">
          <pre class="pipeline-code language-javascript" data-copy-ready="true"><code
              class="language-javascript">{@html data.heroCode}</code
            ></pre>
        </div>
        <div class="pipeline-contract" aria-label="Pipeline contract">
          <div><span>input</span><strong>pulled on demand</strong></div>
          <div><span>async processing</span><strong>8 at a time</strong></div>
          <div><span>output</span><strong>incremental JSONL</strong></div>
        </div>
      </div>
    </div>
  </section>

  <section class="coordination-case">
    <div class="coordination-copy">
      <p class="eyebrow">Why Exstream</p>
      <h2>The easy pipeline is rarely the one that reaches production.</h2>
      <p>
        A loop can read, transform, and write records. Production turns that local sequence into a
        system: several parts now have to agree about pace, delivery, and completion. The hard part
        is no longer any individual callback. It is coordination.
      </p>
      <a class="text-link" href="/docs/">Compare the same pipeline in native Node.js →</a>
    </div>

    <ol class="coordination-steps" aria-label="How a simple loop becomes a coordinated pipeline">
      <li>
        <span>01</span>
        <div>
          <strong>Work starts to overlap</strong>
          <p>Use the available I/O capacity without starting more work than the system can hold.</p>
        </div>
      </li>
      <li>
        <span>02</span>
        <div>
          <strong>The destination falls behind</strong>
          <p>Make the source wait instead of turning a temporary slowdown into a growing queue.</p>
        </div>
      </li>
      <li>
        <span>03</span>
        <div>
          <strong>The flow branches or fails</strong>
          <p>Keep delivery, cancellation, and cleanup part of the same run.</p>
        </div>
      </li>
    </ol>
  </section>

  <section class="contract-statement">
    <div class="contract-copy">
      <p class="eyebrow">Engineering by contract</p>
      <h2>The behavior is part of the API.</h2>
      <p>
        The fluent syntax is the visible part. Underneath it, Exstream favors explicit semantics
        over convenient surprises. That discipline continues through the reference, the type system,
        and execution itself, so a pipeline can be understood before it runs.
      </p>
      <a class="text-link" href="/docs/reference/">Read the operator contracts →</a>
    </div>

    <dl class="contract-points">
      <div>
        <dt>Contracts</dt>
        <dd>Retention, order, errors, and cancellation are documented per operator.</dd>
      </div>
      <div>
        <dt>Types</dt>
        <dd>Value and record-context types evolve through the complete chain.</dd>
      </div>
      <div>
        <dt>Execution</dt>
        <dd>Synchronous transforms stay synchronous; terminal work is always awaitable.</dd>
      </div>
    </dl>
  </section>

  <section class="usage-note">
    <div>
      <p class="eyebrow">When it fits</p>
      <h2>Use Exstream when the pipeline itself is the problem.</h2>
    </div>
    <p>
      If you can explain the job with one loop and a few <code>await</code>s, keep it that way.
      Reach for Exstream when correctness depends not only on each step, but on how the complete
      flow behaves under load, failure, or cancellation.
      <a href="/docs/project/when-not-to-use/">See when Exstream fits →</a>
    </p>
  </section>
</div>

<style>
  .pipeline-panel > .panel-bar {
    padding-right: 0.25rem;
  }

  .panel-bar-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: right;
  }

  .hero-play-button {
    display: grid;
    width: 2rem;
    height: 2rem;
    flex: none;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 50%;
    background: var(--surface);
    color: var(--accent);
    text-decoration: none;
    transition:
      border-color 140ms ease,
      background-color 140ms ease,
      transform 140ms ease;
  }

  .hero-play-button:hover {
    border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
    background: var(--surface-strong);
    transform: translateY(-1px);
  }
</style>
