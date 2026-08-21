<script lang="ts">
  import Maximize2 from '@lucide/svelte/icons/maximize-2'
  import Minimize2 from '@lucide/svelte/icons/minimize-2'
  import { onDestroy, onMount } from 'svelte'

  type GraphNode = {
    id: string
    type: 'source' | 'transform' | 'fork' | 'destination'
    label: string
    depth: number
    input: number
    output: number
    active: number
    ready: number
    window: number
    errors: number
    capacity?: number
    status: 'open' | 'closed' | 'aborted'
    metric?: 'buffered' | 'dropped' | 'errors'
  }

  type GraphEdge = {
    id: string
    from: string
    to: string
    queued: number
    flowed: number
    paused: boolean
    closed: boolean
  }

  type Line = GraphEdge & {
    path: string
    labelX: number
    labelY: number
  }

  type GraphColumn = {
    depth: number
    nodes: GraphNode[]
  }

  type PositionedColumn = {
    depth: number
    nodes: Array<{ node: GraphNode; position: number }>
  }

  let { nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] } = $props()
  let scene = $state<HTMLDivElement>()
  let lines = $state<Line[]>([])
  let expanded = $state(false)
  let resizeObserver: ResizeObserver | undefined
  let frame: number | undefined
  const elements = new Map<string, HTMLElement>()

  const layout = $derived(buildLayout(nodes, edges))

  function buildLayout(graphNodes: GraphNode[], graphEdges: GraphEdge[]) {
    const depths = [...new Set(graphNodes.map((node) => node.depth))].sort((a, b) => a - b)
    const columns: GraphColumn[] = depths.map((depth) => ({
      depth,
      nodes: graphNodes.filter((node) => node.depth === depth),
    }))
    const parents = new Map<string, string[]>()
    const children = new Map<string, string[]>()

    for (const edge of graphEdges) {
      parents.set(edge.to, [...(parents.get(edge.to) ?? []), edge.from])
      children.set(edge.from, [...(children.get(edge.from) ?? []), edge.to])
    }

    for (let pass = 0; pass < 3; pass += 1) {
      sweepColumns(columns, parents, 1, columns.length, 1)
      sweepColumns(columns, children, columns.length - 2, -1, -1)
    }

    const laneCount = Math.max(1, ...columns.map((column) => column.nodes.length))
    const positions = new Map<string, number>()
    const positionedColumns: PositionedColumn[] = columns.map((column) => {
      const previousOrder = new Map(column.nodes.map((node, index) => [node.id, index]))
      const candidates = column.nodes
        .map((node, index) => ({
          node,
          target: barycenter(node.id, parents, positions) ?? (index + 0.5) / column.nodes.length,
        }))
        .sort(
          (left, right) =>
            left.target - right.target ||
            previousOrder.get(left.node.id)! - previousOrder.get(right.node.id)!,
        )
      const resolvedPositions = spreadPositions(
        candidates.map((candidate) => candidate.target),
        laneCount,
      )

      candidates.forEach((candidate, index) => {
        positions.set(candidate.node.id, resolvedPositions[index]!)
      })

      return {
        depth: column.depth,
        nodes: candidates.map((candidate, index) => ({
          node: candidate.node,
          position: resolvedPositions[index]!,
        })),
      }
    })

    return { columns: positionedColumns, laneCount }
  }

  function spreadPositions(targets: number[], laneCount: number) {
    if (targets.length === 0) return []

    const gap = 1 / laneCount
    const minimum = gap / 2
    const maximum = 1 - minimum
    const positions = targets.map((target) => Math.min(maximum, Math.max(minimum, target)))

    for (let index = 1; index < positions.length; index += 1) {
      positions[index] = Math.max(positions[index]!, positions[index - 1]! + gap)
    }
    if (positions.at(-1)! > maximum) {
      positions[positions.length - 1] = maximum
      for (let index = positions.length - 2; index >= 0; index -= 1) {
        positions[index] = Math.min(positions[index]!, positions[index + 1]! - gap)
      }
    }

    return positions
  }

  function sweepColumns(
    columns: GraphColumn[],
    references: Map<string, string[]>,
    start: number,
    end: number,
    step: number,
  ) {
    const positions = nodePositions(columns)

    for (let columnIndex = start; columnIndex !== end; columnIndex += step) {
      const column = columns[columnIndex]
      if (!column || column.nodes.length < 2) continue

      const previousOrder = new Map(column.nodes.map((node, index) => [node.id, index]))
      column.nodes.sort((left, right) => {
        const leftIndex = previousOrder.get(left.id)!
        const rightIndex = previousOrder.get(right.id)!
        const leftScore =
          barycenter(left.id, references, positions) ?? (leftIndex + 0.5) / column.nodes.length
        const rightScore =
          barycenter(right.id, references, positions) ?? (rightIndex + 0.5) / column.nodes.length

        return leftScore - rightScore || previousOrder.get(left.id)! - previousOrder.get(right.id)!
      })

      updateColumnPositions(column, positions)
    }
  }

  function nodePositions(columns: GraphColumn[]) {
    const positions = new Map<string, number>()
    for (const column of columns) updateColumnPositions(column, positions)
    return positions
  }

  function updateColumnPositions(column: GraphColumn, positions: Map<string, number>) {
    const count = column.nodes.length
    column.nodes.forEach((node, index) => positions.set(node.id, (index + 0.5) / count))
  }

  function barycenter(
    nodeId: string,
    references: Map<string, string[]>,
    positions: Map<string, number>,
  ) {
    const referencePositions = (references.get(nodeId) ?? []).flatMap((id) => {
      const position = positions.get(id)
      return position === undefined ? [] : [position]
    })
    if (referencePositions.length === 0) return undefined
    return (
      referencePositions.reduce((total, position) => total + position, 0) /
      referencePositions.length
    )
  }

  function registerNode(element: HTMLElement, id: string) {
    elements.set(id, element)
    resizeObserver?.observe(element)
    scheduleLines()

    return {
      update(nextId: string) {
        elements.delete(id)
        id = nextId
        elements.set(id, element)
        scheduleLines()
      },
      destroy() {
        resizeObserver?.unobserve(element)
        elements.delete(id)
        scheduleLines()
      },
    }
  }

  function registerScene(element: HTMLDivElement) {
    scene = element
    resizeObserver?.observe(element)
    scheduleLines()

    return {
      destroy() {
        resizeObserver?.unobserve(element)
        if (scene === element) scene = undefined
      },
    }
  }

  function incomingQueue(nodeId: string) {
    return edges
      .filter((edge) => edge.to === nodeId)
      .reduce((total, edge) => total + edge.queued, 0)
  }

  function scheduleLines() {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = requestAnimationFrame(updateLines)
  }

  function updateLines() {
    frame = undefined
    if (!scene) return
    const sceneBox = scene.getBoundingClientRect()

    lines = edges.flatMap((edge) => {
      const from = elements.get(edge.from)?.getBoundingClientRect()
      const to = elements.get(edge.to)?.getBoundingClientRect()
      if (!from || !to) return []

      const x1 = from.right - sceneBox.left
      const y1 = from.top + from.height / 2 - sceneBox.top
      const x2 = to.left - sceneBox.left
      const y2 = to.top + to.height / 2 - sceneBox.top
      const bend = Math.max(24, (x2 - x1) * 0.48)

      return [
        {
          ...edge,
          path: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
          labelX: x1 + (x2 - x1) * 0.52,
          labelY: y1 + (y2 - y1) * 0.52,
        },
      ]
    })
  }

  function graphChanged(nodeCount: number, edgeCount: number) {
    if (nodeCount === 0 && edgeCount === 0) lines = []
    scheduleLines()
  }

  function toggleExpanded() {
    expanded = !expanded
    scheduleLines()
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (!expanded || event.key !== 'Escape') return
    expanded = false
    scheduleLines()
  }

  $effect(() => graphChanged(nodes.length, edges.length))

  onMount(() => {
    resizeObserver = new ResizeObserver(scheduleLines)
    if (scene) resizeObserver.observe(scene)
    for (const element of elements.values()) resizeObserver.observe(element)
    scheduleLines()
  })

  onDestroy(() => {
    resizeObserver?.disconnect()
    if (frame !== undefined) cancelAnimationFrame(frame)
  })
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<section class:expanded class="graph" aria-label="Live pipeline graph">
  <header>
    <strong>Pipeline</strong>
    <div class="graph-actions">
      <span>live telemetry</span>
      <button
        type="button"
        class="expand-toggle"
        onclick={toggleExpanded}
        aria-label={expanded ? 'Restore pipeline graph' : 'Expand pipeline graph'}
        title={expanded ? 'Restore graph (Esc)' : 'Expand graph'}
      >
        {#if expanded}
          <Minimize2 size={15} strokeWidth={1.8} aria-hidden="true" />
        {:else}
          <Maximize2 size={15} strokeWidth={1.8} aria-hidden="true" />
        {/if}
      </button>
    </div>
  </header>

  <div class="canvas">
    {#if nodes.length === 0}
      <div class="empty">Run the pipeline to build its graph.</div>
    {:else}
      <div
        class="scene"
        use:registerScene
        style={`--column-count:${layout.columns.length};--layout-min-height:${layout.laneCount * 8}rem`}
      >
        <svg aria-hidden="true">
          <defs>
            <marker
              id="graph-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z"></path>
            </marker>
          </defs>
          {#each lines as line (line.id)}
            <path
              class:waiting={line.queued > 0}
              class:paused={line.paused}
              class:closed={line.closed}
              d={line.path}
              marker-end="url(#graph-arrow)"
            ></path>
          {/each}
        </svg>

        {#each lines as line (line.id)}
          <span
            class:waiting={line.queued > 0}
            class:paused={line.paused}
            class:closed={line.closed}
            class="edge-count"
            style={`left:${line.labelX}px;top:${line.labelY}px`}
          >
            {line.closed
              ? 'closed'
              : line.paused
                ? 'paused upstream'
                : line.queued > 0
                  ? `${line.queued} waiting`
                  : line.flowed.toLocaleString('en')}
          </span>
        {/each}

        <div
          class="columns"
          style={`grid-template-columns: repeat(${layout.columns.length}, minmax(8.5rem, 1fr))`}
        >
          {#each layout.columns as column (column.depth)}
            <div class="column">
              {#each column.nodes as positionedNode (positionedNode.node.id)}
                {@const node = positionedNode.node}
                <article
                  class:type-source={node.type === 'source'}
                  class:type-fork={node.type === 'fork'}
                  class:type-destination={node.type === 'destination'}
                  use:registerNode={node.id}
                  style={`--node-position:${positionedNode.position}`}
                >
                  <span>{node.type}</span>
                  <strong>{node.label}</strong>
                  <dl>
                    {#if node.type !== 'source'}
                      <div>
                        <dt>in</dt>
                        <dd>{node.input.toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    <div>
                      <dt>out</dt>
                      <dd>{node.output.toLocaleString('en')}</dd>
                    </div>
                    {#if node.metric === 'dropped' && node.input > node.output}
                      <div>
                        <dt>dropped</dt>
                        <dd>{(node.input - node.output).toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    {#if node.metric === 'buffered'}
                      <div>
                        <dt>buffered</dt>
                        <dd>{Math.max(0, node.input - node.output).toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    {#if node.errors > 0}
                      <div>
                        <dt>errors</dt>
                        <dd>{node.errors.toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    {#if node.active > 0 || node.capacity !== undefined}
                      <div>
                        <dt>active</dt>
                        <dd>{node.active.toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    {#if node.ready > 0}
                      <div>
                        <dt>ready</dt>
                        <dd>{node.ready.toLocaleString('en')}</dd>
                      </div>
                    {/if}
                    {#if node.capacity !== undefined}
                      <div>
                        <dt>window</dt>
                        <dd>{node.window} / {node.capacity}</dd>
                      </div>
                    {/if}
                  </dl>
                  {#if incomingQueue(node.id) > 0}
                    <small>{incomingQueue(node.id)} queued upstream</small>
                  {/if}
                </article>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .graph {
    display: grid;
    min-height: 0;
    grid-template-rows: 2.65rem minmax(0, 1fr);
    border-bottom: 1px solid var(--pg-line);
    background: var(--pg-graph);
    color: var(--pg-ink);
  }

  .graph.expanded {
    position: absolute;
    z-index: 10;
    inset: 0;
    border-bottom: 0;
  }

  .graph > header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--pg-line);
    padding: 0 0.85rem;
    font: 0.72rem var(--font-mono);
  }

  .graph-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .graph-actions span {
    color: var(--pg-muted);
  }

  .expand-toggle {
    display: grid;
    width: 1.8rem;
    height: 1.8rem;
    place-items: center;
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.38rem;
    background: var(--pg-panel);
    color: var(--pg-muted);
    cursor: pointer;
  }

  .expand-toggle:hover {
    border-color: var(--pg-line-hover);
    color: var(--pg-ink);
  }

  .expand-toggle:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .canvas {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: auto;
    padding: 1.1rem;
  }

  .empty {
    display: grid;
    height: 100%;
    place-items: center;
    color: var(--pg-dim);
    font: 0.76rem var(--font-mono);
  }

  .scene {
    position: relative;
    width: max(100%, calc(var(--column-count) * 14.3rem - 4.8rem));
    min-height: max(100%, var(--layout-min-height));
  }

  svg {
    position: absolute;
    z-index: 0;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  svg > path {
    fill: none;
    stroke: var(--pg-edge);
    stroke-width: 1.25;
  }

  svg > path.waiting {
    stroke: var(--pg-accent);
    stroke-width: 2;
  }

  svg > path.paused {
    stroke: var(--pg-danger-ink);
    stroke-width: 2;
    stroke-dasharray: 6 4;
  }

  svg > path.closed {
    stroke: var(--pg-edge-closed);
    stroke-dasharray: 3 3;
  }

  marker path {
    fill: var(--pg-dim);
  }

  .columns {
    position: absolute;
    z-index: 1;
    inset: 0;
    display: grid;
    width: 100%;
    align-items: stretch;
    gap: 4.8rem;
  }

  .column {
    position: relative;
    min-height: 100%;
  }

  article {
    position: absolute;
    top: calc(var(--node-position) * 100%);
    left: 50%;
    width: 9.5rem;
    min-height: 6.2rem;
    transform: translate(-50%, -50%);
    border: 1px solid var(--pg-line-strong);
    border-radius: 0.65rem;
    background: var(--pg-panel-raised);
    padding: 0.62rem;
    box-shadow: var(--pg-shadow);
  }

  article.type-source {
    border-color: color-mix(in srgb, var(--accent) 70%, var(--pg-line-strong));
  }

  article.type-fork {
    border-color: var(--pg-purple);
  }

  article.type-destination {
    border-color: var(--pg-success);
  }

  article > span {
    display: block;
    color: var(--pg-dim);
    font: 0.58rem var(--font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  article > strong {
    display: block;
    overflow: hidden;
    margin-top: 0.18rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    font: 0.74rem var(--font-mono);
  }

  dl {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem 0.65rem;
    margin: 0.65rem 0 0;
  }

  dl div {
    display: flex;
    gap: 0.25rem;
  }

  dt,
  dd {
    margin: 0;
    font: 0.58rem var(--font-mono);
  }

  dt {
    color: var(--pg-dim);
  }

  dd {
    color: var(--pg-ink-soft);
  }

  article small {
    display: block;
    margin-top: 0.45rem;
    color: var(--pg-danger-ink);
    font: 0.56rem var(--font-mono);
  }

  .edge-count {
    position: absolute;
    z-index: 2;
    transform: translate(-50%, -50%);
    border: 1px solid var(--pg-line-strong);
    border-radius: 999px;
    background: var(--pg-graph);
    color: var(--pg-dim);
    padding: 0.13rem 0.35rem;
    white-space: nowrap;
    font: 0.52rem var(--font-mono);
    pointer-events: none;
  }

  .edge-count.waiting,
  .edge-count.paused {
    border-color: var(--pg-danger-border);
    color: var(--pg-danger-ink);
  }

  .edge-count.closed {
    border-color: var(--pg-line);
    color: var(--pg-dim);
  }
</style>
