import realExstream from 'exstream.js'
import {
  adapterMethodNames,
  destinationMethodNames,
  operatorTelemetry,
  terminalMethodNames,
  type OperatorTelemetry,
} from '$lib/playgroundOperators'

const firstNames = [
  'Ada',
  'Amara',
  'Ari',
  'Bruno',
  'Camila',
  'Chloe',
  'Dario',
  'Elena',
  'Elliot',
  'Fatima',
  'Felix',
  'Giulia',
  'Hana',
  'Hugo',
  'Iris',
  'Jonas',
  'Kai',
  'Leila',
  'Leo',
  'Marta',
  'Mateo',
  'Mina',
  'Nadia',
  'Noah',
  'Omar',
  'Priya',
  'Ravi',
  'Sofia',
  'Theo',
  'Zoe',
] as const

const lastNames = [
  'Bianchi',
  'Brown',
  'Chen',
  'Costa',
  'Dubois',
  'Esposito',
  'Fischer',
  'Garcia',
  'Gupta',
  'Haddad',
  'Ivanov',
  'Johnson',
  'Khan',
  'Kim',
  'Kowalski',
  'Lopez',
  'Martin',
  'Meyer',
  'Moretti',
  'Nakamura',
  'Novak',
  'Okafor',
  'Patel',
  'Rossi',
  'Silva',
  'Singh',
  'Smith',
  'Tanaka',
  'Taylor',
  'Wilson',
] as const

const products = [
  'Analytics Pro',
  'API Credits',
  'Archive Storage',
  'Audit Log',
  'Backup Vault',
  'Batch Compute',
  'Cloud Workspace',
  'Data Connector',
  'Data Export',
  'Edge Functions',
  'Email Relay',
  'Enterprise Support',
  'Event Stream',
  'Fraud Monitor',
  'Identity Plus',
  'Invoice Automation',
  'Log Retention',
  'Managed Database',
  'Metrics Pack',
  'Mobile SDK',
  'Observability Suite',
  'Payment Gateway',
  'Realtime Sync',
  'Report Builder',
  'Search Index',
  'Security Scan',
  'Team Seats',
  'Usage Insights',
  'Video Processing',
  'Webhook Delivery',
] as const

const terminalMethods = new Set<string>(terminalMethodNames)
const destinationMethods = new Set<string>(destinationMethodNames)
const adapterMethods = new Set<string>(adapterMethodNames)

type DestinationConfig = {
  name: string
  delay: number
  bufferSize: number
}

type DestinationOptions = {
  speed?: number
}

type RunMessage = {
  type: 'run'
  code: string
  destinations: DestinationConfig[]
}

type ConfigureDestinationMessage = {
  type: 'destination:configure'
  name: string
  delay: number
}

type SourceEventMessage = {
  type: 'source:event'
  name: 'mousemove'
  value: unknown
}

type PlaygroundMessage = RunMessage | ConfigureDestinationMessage | SourceEventMessage

type GraphNode = {
  id: string
  type: 'source' | 'transform' | 'fork' | 'destination'
  label: string
  depth: number
  input: number
  output: number
  active: number
  ready: number
  errors: number
  capacity?: number
  status: 'open' | 'closed' | 'aborted'
  metric?: 'buffered' | 'dropped' | 'errors'
}

type GraphEdge = {
  id: string
  from: string
  to: string
  flowed?: number
  produced?: number
}

type MergeInput = {
  target: StreamTarget
  nodeId: string
}

type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

type ConsoleEntry = {
  level: ConsoleLevel
  message: string
  elapsed: number
}

type DestinationRuntime = DestinationConfig & {
  nodeId?: string
  count: number
  values: unknown[]
  state: 'idle' | 'open' | 'closed' | 'aborted'
  snapshotTimer?: ReturnType<typeof setTimeout>
  wakeDelay?: () => void
}

type AsyncFunction = (...arguments_: unknown[]) => Promise<unknown>
type AsyncFunctionConstructor = new (...arguments_: string[]) => AsyncFunction
type StreamTarget = object
type StreamOptions = {
  bufferLimit?: number
  overflow?: 'error' | 'drop-oldest' | 'drop-newest'
  signal?: AbortSignal
  start?: 'auto' | 'manual'
}

const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor as AsyncFunctionConstructor
const StreamConstructor = realExstream([]).constructor as new (...arguments_: unknown[]) => object

let graphNodes = new Map<string, GraphNode>()
let graphEdges: GraphEdge[] = []
let destinations = new Map<string, DestinationRuntime>()
let eventSources = new Map<string, EventTarget>()
let sourceLabels = new WeakMap<object, string>()
let forkStates = new WeakMap<StreamTarget, { stream: StreamTarget; nodeId: string }>()
let proxyTargets = new WeakMap<object, StreamTarget>()
let proxyNodeIds = new WeakMap<object, string>()
let writableDestinations = new WeakMap<object, DestinationRuntime>()
let nextNodeId = 1
let nextEdgeId = 1
let telemetryTimer: ReturnType<typeof setTimeout> | undefined
let consoleTimer: ReturnType<typeof setTimeout> | undefined
let consoleEntries: ConsoleEntry[] = []
let runStartedAt = 0

function send(message: Record<string, unknown>) {
  self.postMessage(message)
}

function sleep(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForDestination(runtime: DestinationRuntime) {
  const startedAt = performance.now()

  while (true) {
    const remaining = runtime.delay - (performance.now() - startedAt)
    if (remaining <= 0) return

    await new Promise<void>((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (runtime.wakeDelay === finish) runtime.wakeDelay = undefined
        resolve()
      }
      const timer = setTimeout(finish, remaining)
      runtime.wakeDelay = finish
    })
  }
}

function randomGenerator(seed = 0x5eed1234) {
  let value = seed >>> 0

  return () => {
    value ^= value << 13
    value ^= value >>> 17
    value ^= value << 5
    return (value >>> 0) / 4_294_967_296
  }
}

async function* transactionSource() {
  const random = randomGenerator()
  const startedAt = Date.UTC(2026, 0, 1, 0, 0, 0)
  let sequence = 0

  while (true) {
    const firstName = firstNames[Math.floor(random() * firstNames.length)]!
    const lastName = lastNames[Math.floor(random() * lastNames.length)]!
    const product = products[Math.floor(random() * products.length)]!
    const amount = Math.round((10 + random() * 9_990) * 100) / 100

    yield {
      id: `txn_${String(sequence + 1).padStart(8, '0')}`,
      customer: `${firstName} ${lastName}`,
      product,
      amount,
      timestamp: new Date(startedAt + sequence * 1_000).toISOString(),
    }

    sequence += 1
    if (sequence % 250 === 0) await sleep(0)
  }
}

function source(name: string) {
  if (name === 'transactions') {
    const transactions = transactionSource()
    sourceLabels.set(transactions, 'transactions ∞')
    return transactions
  }
  if (name === 'mousemove') {
    let target = eventSources.get(name)
    if (!target) {
      target = new EventTarget()
      eventSources.set(name, target)
    }
    return target
  }

  throw new Error(`Unknown source "${name}". Available sources: transactions, mousemove.`)
}

function destination(name: string, options: DestinationOptions = {}) {
  const defaultDelay = destinationDelay(options.speed)
  let runtime = destinations.get(name)
  if (!runtime) {
    runtime = {
      name,
      delay: defaultDelay,
      bufferSize: 10,
      count: 0,
      values: [],
      state: 'idle',
    }
    destinations.set(name, runtime)
  }
  if (runtime.state === 'open') {
    throw new Error(`Destination "${name}" is already connected.`)
  }

  send({
    type: 'destination:registered',
    name: runtime.name,
    delay: runtime.delay,
    bufferSize: runtime.bufferSize,
  })
  runtime.nodeId ??= addNode('destination', name, 0)
  graphNodes.get(runtime.nodeId)!.status = 'open'
  runtime.state = 'open'
  runtime.count = 0
  runtime.values = []
  sendDestinationSnapshot(runtime)

  const writable = new WritableStream({
    async write(value) {
      if (runtime.delay > 0) await waitForDestination(runtime)
      runtime.count += 1
      runtime.values.push(value)
      if (runtime.values.length > runtime.bufferSize) runtime.values.shift()

      const node = graphNodes.get(runtime.nodeId!)!
      node.input = runtime.count
      node.output = runtime.count

      if (runtime.delay === 0 && runtime.count % 250 === 0) await sleep(0)
      scheduleDestinationSnapshot(runtime)
      scheduleTelemetry()
    },
    close() {
      runtime.state = 'closed'
      graphNodes.get(runtime.nodeId!)!.status = 'closed'
      sendDestinationSnapshot(runtime)
      flushTelemetry()
    },
    abort(reason) {
      runtime.state = 'aborted'
      graphNodes.get(runtime.nodeId!)!.status = 'aborted'
      sendDestinationSnapshot(runtime, formatArgument(reason))
      flushTelemetry()
    },
  })
  writableDestinations.set(writable, runtime)
  return writable
}

function destinationDelay(speed: number | undefined) {
  if (speed === undefined) return 100
  if (speed === Infinity) return 0
  if (!Number.isFinite(speed) || speed <= 0) {
    throw new Error('destination() speed must be a positive number or Infinity.')
  }
  return 1_000 / speed
}

function scheduleDestinationSnapshot(runtime: DestinationRuntime) {
  if (runtime.snapshotTimer) return
  runtime.snapshotTimer = setTimeout(() => {
    runtime.snapshotTimer = undefined
    sendDestinationSnapshot(runtime)
  }, 50)
}

function sendDestinationSnapshot(runtime: DestinationRuntime, reason?: string) {
  if (runtime.snapshotTimer) {
    clearTimeout(runtime.snapshotTimer)
    runtime.snapshotTimer = undefined
  }
  send({
    type: 'destination:snapshot',
    name: runtime.name,
    values: runtime.values,
    count: runtime.count,
    state: runtime.state,
    reason,
  })
}

function instrumentedExstream(input?: unknown, options?: StreamOptions | null) {
  const mergeInputs = extractMergeInputs(input)
  if (mergeInputs) {
    return wrapStream(realExstream([]) as StreamTarget, undefined, mergeInputs)
  }

  const manual = input === undefined || input === null
  const sourceLabel = manual ? 'work queue' : describeSource(input)
  const sourceNodeId = addNode('source', sourceLabel, 0)
  const node = graphNodes.get(sourceNodeId)!

  if (manual) {
    const stream = realExstream(input, options) as StreamTarget
    watchNodeLifecycle(stream, sourceNodeId)
    return wrapStream(stream, sourceNodeId)
  }

  const sourceInput =
    input && typeof input === 'object' ? (proxyTargets.get(input as object) ?? input) : input
  const stream = (
    realExstream as unknown as (
      source?: unknown,
      streamOptions?: StreamOptions | null,
    ) => StreamTarget
  )(sourceInput, options)
  const observed = callTargetMethod(stream, 'tap', () => {
    node.output += 1
    scheduleTelemetry()
  })
  watchNodeLifecycle(observed, sourceNodeId)
  return wrapStream(observed, sourceNodeId)
}

Object.assign(instrumentedExstream, realExstream, {
  defer: instrumentedDefer,
  fromEvent: instrumentedFromEvent,
})

function instrumentedDefer(factory: unknown, options?: StreamOptions | null) {
  const createDeferred = realExstream.defer as unknown as (
    sourceFactory: unknown,
    sourceOptions?: StreamOptions | null,
  ) => object
  const deferred = createDeferred(factory, options)
  sourceLabels.set(deferred, 'deferred source')
  return deferred
}

function describeSource(input: unknown) {
  if ((typeof input === 'object' && input !== null) || typeof input === 'function') {
    const knownLabel = sourceLabels.get(input as object)
    if (knownLabel) return knownLabel
  }
  if (Array.isArray(input)) return `array (${input.length.toLocaleString('en')})`
  if (typeof input === 'string') return 'string'
  if (input instanceof ReadableStream) return 'Web ReadableStream'
  if (ArrayBuffer.isView(input)) return input.constructor.name
  if (!input || (typeof input !== 'object' && typeof input !== 'function')) return 'source'

  const candidate = input as {
    then?: unknown
    [Symbol.asyncIterator]?: unknown
    [Symbol.iterator]?: unknown
  }
  if (typeof candidate.then === 'function') return 'promise'
  if (typeof candidate[Symbol.asyncIterator] === 'function') return 'async iterable'
  if (typeof candidate[Symbol.iterator] === 'function') return 'iterable'
  return 'source'
}

function instrumentedFromEvent(target: unknown, eventName: string, options?: unknown) {
  const sourceNodeId = addNode('source', `${eventName} (hot)`, 0)
  const node = graphNodes.get(sourceNodeId)!
  const fromEvent = realExstream.fromEvent as unknown as (
    target: unknown,
    eventName: string,
    options?: unknown,
  ) => StreamTarget
  const stream = fromEvent(target, eventName, options)
  const observed = callTargetMethod(stream, 'tap', () => {
    node.output += 1
    scheduleTelemetry()
  })
  watchNodeLifecycle(observed, sourceNodeId)
  return wrapStream(observed, sourceNodeId)
}

function extractMergeInputs(input: unknown): MergeInput[] | undefined {
  if (!Array.isArray(input) || input.length === 0) return undefined

  const inputs = input.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return []
    const target = proxyTargets.get(candidate)
    const nodeId = proxyNodeIds.get(candidate)
    return target && nodeId ? [{ target, nodeId }] : []
  })

  return inputs.length === input.length ? inputs : undefined
}

function wrapStream(
  target: StreamTarget,
  nodeId: string | undefined,
  mergeInputs?: MergeInput[],
): object {
  const proxy = new Proxy(target, {
    get(stream, property) {
      const value = Reflect.get(stream, property, stream)
      if (typeof value !== 'function') return value

      return (...arguments_: unknown[]) =>
        callStreamMethod(stream, nodeId, String(property), value, arguments_, mergeInputs)
    },
  })

  proxyTargets.set(proxy, target)
  if (nodeId) proxyNodeIds.set(proxy, nodeId)
  return proxy
}

function callStreamMethod(
  target: StreamTarget,
  parentNodeId: string | undefined,
  methodName: string,
  method: (...arguments_: unknown[]) => unknown,
  arguments_: unknown[],
  mergeInputs?: MergeInput[],
) {
  const unwrappedArguments = arguments_.map(
    (argument) => proxyTargets.get(argument as object) ?? argument,
  )

  if (methodName === 'merge' && mergeInputs) {
    return instrumentMerge(mergeInputs, unwrappedArguments)
  }
  if (methodName === 'sortedJoin' && parentNodeId) {
    const rightProxy = arguments_[0]
    const rightTarget =
      rightProxy && typeof rightProxy === 'object'
        ? proxyTargets.get(rightProxy as object)
        : undefined
    const rightNodeId =
      rightProxy && typeof rightProxy === 'object'
        ? proxyNodeIds.get(rightProxy as object)
        : undefined
    if (rightTarget && rightNodeId) {
      return instrumentSortedJoin(
        { nodeId: parentNodeId, target },
        { nodeId: rightNodeId, target: rightTarget },
        unwrappedArguments[1],
      )
    }
  }
  if (!parentNodeId) {
    throw new Error('A stream collection must be consumed with merge() before other operators.')
  }

  if (methodName === 'fork') return instrumentFork(target, parentNodeId, unwrappedArguments)
  if (methodName === 'observe') {
    return instrumentObserve(target, parentNodeId, method, unwrappedArguments)
  }
  if (methodName === 'routeErrors') {
    return instrumentRouteErrors(target, parentNodeId, method, unwrappedArguments)
  }
  if (methodName === 'pipe' || destinationMethods.has(methodName)) {
    return instrumentPipe(target, parentNodeId, methodName, unwrappedArguments)
  }
  if (terminalMethods.has(methodName)) {
    return instrumentTerminal(target, parentNodeId, methodName, unwrappedArguments)
  }
  if (adapterMethods.has(methodName)) {
    return instrumentReadableAdapter(target, parentNodeId, methodName, unwrappedArguments)
  }
  if (methodName === 'write') {
    const result = Reflect.apply(method, target, unwrappedArguments)
    const node = graphNodes.get(parentNodeId)
    if (node) {
      node.output += 1
      scheduleTelemetry()
    }
    return result
  }

  const telemetry = (operatorTelemetry as Record<string, OperatorTelemetry>)[methodName]
  if (!telemetry) {
    const result = Reflect.apply(method, target, unwrappedArguments)
    return isStream(result) ? wrapStream(result, parentNodeId) : result
  }

  const parent = graphNodes.get(parentNodeId)!
  const nodeId = addNode(
    'transform',
    formatOperator(methodName, arguments_),
    parent.depth + 1,
    telemetry.metric,
  )
  const node = graphNodes.get(nodeId)!
  addEdge(parentNodeId, nodeId)

  if (telemetry.capacity === 'mapAsync' && typeof unwrappedArguments[0] === 'function') {
    node.capacity = mapAsyncCapacity(unwrappedArguments[1])
    const operation = unwrappedArguments[0] as (...values: unknown[]) => unknown
    unwrappedArguments[0] = async (...values: unknown[]) => {
      node.active += 1
      scheduleTelemetry()
      try {
        const result = await operation(...values)
        node.ready += 1
        return result
      } finally {
        node.active -= 1
        scheduleTelemetry()
      }
    }
  }

  const countedInput = callTargetMethod(target, 'tap', () => {
    node.input += 1
    scheduleTelemetry()
  })
  const result = Reflect.apply(method, countedInput, unwrappedArguments)
  if (!isStream(result)) return result

  const errorCountedResult =
    node.metric === 'errors'
      ? callTargetMethod(result, 'errors', (error: unknown, push: (error: unknown) => void) => {
          node.errors += 1
          scheduleTelemetry()
          push(error)
        })
      : result
  const countedOutput = callTargetMethod(errorCountedResult, 'tap', () => {
    node.output += 1
    if (methodName === 'mapAsync' && node.ready > 0) node.ready -= 1
    scheduleTelemetry()
  })
  watchNodeLifecycle(countedOutput, nodeId)
  return wrapStream(countedOutput, nodeId)
}

function mapAsyncCapacity(options: unknown) {
  if (options === null || options === undefined) return 1
  if (typeof options !== 'object' || Array.isArray(options)) return undefined

  const concurrency = (options as { concurrency?: unknown }).concurrency
  if (concurrency === undefined) return 1
  if (
    typeof concurrency === 'number' &&
    Number.isFinite(concurrency) &&
    Number.isInteger(concurrency) &&
    concurrency > 0
  ) {
    return concurrency
  }
  return undefined
}

function instrumentMerge(inputs: MergeInput[], arguments_: unknown[]) {
  const parentNodes = inputs.map((input) => graphNodes.get(input.nodeId)!).filter(Boolean)
  const depth = Math.max(...parentNodes.map((node) => node.depth)) + 1
  const nodeId = addNode('transform', formatOperator('merge', arguments_), depth, 'buffered')
  const node = graphNodes.get(nodeId)!

  const countedInputs = inputs.map((input) => {
    const edge = addEdge(input.nodeId, nodeId, true)
    return callTargetMethod(input.target, 'tap', () => {
      node.input += 1
      edge.flowed = (edge.flowed ?? 0) + 1
      scheduleTelemetry()
    })
  })
  const carrier = realExstream(countedInputs) as StreamTarget
  const combine = Reflect.get(carrier, 'merge', carrier) as (...values: unknown[]) => unknown
  const result = Reflect.apply(combine, carrier, arguments_)
  return instrumentCombinedResult(result, node, nodeId)
}

function instrumentSortedJoin(left: MergeInput, right: MergeInput, options: unknown) {
  const parentNodes = [graphNodes.get(left.nodeId), graphNodes.get(right.nodeId)].filter(Boolean)
  const depth = Math.max(...parentNodes.map((node) => node!.depth)) + 1
  const nodeId = addNode('transform', formatOperator('sortedJoin', [options]), depth, 'errors')
  const node = graphNodes.get(nodeId)!

  const countInput = (input: MergeInput) => {
    const edge = addEdge(input.nodeId, nodeId, true)
    return callTargetMethod(input.target, 'tap', () => {
      node.input += 1
      edge.flowed = (edge.flowed ?? 0) + 1
      scheduleTelemetry()
    })
  }
  const countedLeft = countInput(left)
  const countedRight = countInput(right)
  const join = Reflect.get(countedLeft, 'sortedJoin', countedLeft) as (
    right: StreamTarget,
    options: unknown,
  ) => unknown
  const result = Reflect.apply(join, countedLeft, [countedRight, options])
  return instrumentCombinedResult(result, node, nodeId)
}

function instrumentCombinedResult(result: unknown, node: GraphNode, nodeId: string) {
  if (!isStream(result)) return result

  const errorCountedResult =
    node.metric === 'errors'
      ? callTargetMethod(result, 'errors', (error: unknown, push: (error: unknown) => void) => {
          node.errors += 1
          scheduleTelemetry()
          push(error)
        })
      : result
  const countedOutput = callTargetMethod(errorCountedResult, 'tap', () => {
    node.output += 1
    scheduleTelemetry()
  })
  watchNodeLifecycle(countedOutput, nodeId)
  return wrapStream(countedOutput, nodeId)
}

function instrumentFork(target: StreamTarget, parentNodeId: string, arguments_: unknown[]) {
  let fork = forkStates.get(target)

  if (!fork) {
    const parent = graphNodes.get(parentNodeId)!
    const nodeId = addNode('fork', 'fork', parent.depth + 1)
    const node = graphNodes.get(nodeId)!
    addEdge(parentNodeId, nodeId)
    const counted = callTargetMethod(target, 'tap', () => {
      node.input += 1
      node.output += 1
      scheduleTelemetry()
    })
    watchNodeLifecycle(counted, nodeId)
    fork = { stream: counted, nodeId }
    forkStates.set(target, fork)
  }

  const branchMethod = Reflect.get(fork.stream, 'fork', fork.stream) as (
    ...values: unknown[]
  ) => unknown
  const branch = Reflect.apply(branchMethod, fork.stream, arguments_)
  if (!isStream(branch)) return branch
  return wrapStream(branch, fork.nodeId)
}

function instrumentObserve(
  target: StreamTarget,
  parentNodeId: string,
  method: (...arguments_: unknown[]) => unknown,
  arguments_: unknown[],
) {
  const branch = Reflect.apply(method, target, arguments_)
  if (!isStream(branch)) return branch

  const parent = graphNodes.get(parentNodeId)!
  const nodeId = addNode('fork', 'observe', parent.depth + 1)
  const node = graphNodes.get(nodeId)!
  addEdge(parentNodeId, nodeId)

  const counted = callTargetMethod(branch, 'tap', () => {
    node.input += 1
    node.output += 1
    scheduleTelemetry()
  })
  watchNodeLifecycle(counted, nodeId)
  return wrapStream(counted, nodeId)
}

function instrumentRouteErrors(
  target: StreamTarget,
  parentNodeId: string,
  method: (...arguments_: unknown[]) => unknown,
  arguments_: unknown[],
) {
  const routed = Reflect.apply(method, target, arguments_) as {
    output?: unknown
    deadLetters?: unknown
  }
  if (!isStream(routed.output) || !isStream(routed.deadLetters)) return routed

  const parent = graphNodes.get(parentNodeId)!
  const routeNodeId = addNode('fork', 'routeErrors', parent.depth + 1)
  const routeNode = graphNodes.get(routeNodeId)!
  addEdge(parentNodeId, routeNodeId)

  function observeBranch(stream: StreamTarget, label: string) {
    const nodeId = addNode('transform', label, routeNode.depth + 1)
    const node = graphNodes.get(nodeId)!
    const edge = addEdge(routeNodeId, nodeId, true)
    edge.produced = 0

    const counted = callTargetMethod(stream, 'tap', () => {
      routeNode.input += 1
      routeNode.output += 1
      node.input += 1
      node.output += 1
      edge.produced = (edge.produced ?? 0) + 1
      edge.flowed = (edge.flowed ?? 0) + 1
      scheduleTelemetry()
    })
    watchNodeLifecycle(counted, nodeId)
    return { nodeId, stream: counted }
  }

  const output = observeBranch(routed.output, 'output')
  const deadLetters = observeBranch(routed.deadLetters, 'dead letters')
  watchCombinedLifecycle([output.stream, deadLetters.stream], routeNodeId)

  return {
    output: wrapStream(output.stream, output.nodeId),
    deadLetters: wrapStream(deadLetters.stream, deadLetters.nodeId),
  }
}

function instrumentPipe(
  target: StreamTarget,
  parentNodeId: string,
  methodName: string,
  arguments_: unknown[],
) {
  const writable = arguments_[0]
  const runtime =
    writable && typeof writable === 'object' ? writableDestinations.get(writable) : undefined

  if (runtime?.nodeId && writable && typeof (writable as WritableStream).getWriter === 'function') {
    const parent = graphNodes.get(parentNodeId)!
    const destinationNode = graphNodes.get(runtime.nodeId)!
    destinationNode.depth = Math.max(destinationNode.depth, parent.depth + 1)
    addEdge(parentNodeId, runtime.nodeId)
    flushTelemetry()
    return callTargetMethod(target, methodName, ...arguments_)
  }

  const parent = graphNodes.get(parentNodeId)!
  const nodeId = addNode('destination', methodName, parent.depth + 1)
  const node = graphNodes.get(nodeId)!
  addEdge(parentNodeId, nodeId)
  const counted = observeDestinationInput(target, node)
  const result = callTargetMethod(counted, methodName, ...arguments_)
  watchPromiseLifecycle(result, nodeId)
  flushTelemetry()
  return result
}

function instrumentTerminal(
  target: StreamTarget,
  parentNodeId: string,
  methodName: string,
  arguments_: unknown[],
) {
  const parent = graphNodes.get(parentNodeId)!
  const nodeId = addNode('destination', methodName, parent.depth + 1)
  const node = graphNodes.get(nodeId)!
  addEdge(parentNodeId, nodeId)

  const counted = observeDestinationInput(target, node)
  const result = callTargetMethod(counted, methodName, ...arguments_)
  watchPromiseLifecycle(result, nodeId)
  return result
}

function instrumentReadableAdapter(
  target: StreamTarget,
  parentNodeId: string,
  methodName: string,
  arguments_: unknown[],
) {
  const parent = graphNodes.get(parentNodeId)!
  const nodeId = addNode('destination', methodName, parent.depth + 1)
  const node = graphNodes.get(nodeId)!
  addEdge(parentNodeId, nodeId)

  const counted = observeDestinationInput(target, node)
  watchNodeLifecycle(counted, nodeId)
  return callTargetMethod(counted, methodName, ...arguments_)
}

function observeDestinationInput(target: StreamTarget, node: GraphNode) {
  const counted = callTargetMethod(target, 'tap', () => {
    node.input += 1
    node.output += 1
    scheduleTelemetry()
  })
  return callTargetMethod(counted, 'errors', (error: unknown, push: (error: unknown) => void) => {
    node.errors += 1
    scheduleTelemetry()
    push(error)
  })
}

function callTargetMethod(target: StreamTarget, name: string, ...arguments_: unknown[]) {
  const method = Reflect.get(target, name, target) as (...values: unknown[]) => object
  return Reflect.apply(method, target, arguments_)
}

function watchNodeLifecycle(target: StreamTarget, nodeId: string) {
  const once = Reflect.get(target, 'once', target)
  if (typeof once !== 'function') return

  Reflect.apply(once, target, [
    'end',
    () => {
      const node = graphNodes.get(nodeId)
      if (!node || node.status !== 'open') return
      node.status = 'closed'
      flushTelemetry()
    },
  ])
  Reflect.apply(once, target, [
    'abort',
    () => {
      const node = graphNodes.get(nodeId)
      if (!node) return
      node.status = 'aborted'
      flushTelemetry()
    },
  ])
}

function watchCombinedLifecycle(targets: StreamTarget[], nodeId: string) {
  let remaining = targets.length
  let aborted = false

  for (const target of targets) {
    const once = Reflect.get(target, 'once', target)
    if (typeof once !== 'function') continue
    let settled = false

    const finish = (wasAborted: boolean) => {
      if (settled) return
      settled = true
      aborted ||= wasAborted
      remaining -= 1
      if (remaining > 0) return

      const node = graphNodes.get(nodeId)
      if (!node) return
      node.status = aborted ? 'aborted' : 'closed'
      flushTelemetry()
    }

    Reflect.apply(once, target, ['end', () => finish(false)])
    Reflect.apply(once, target, ['abort', () => finish(true)])
  }
}

function watchPromiseLifecycle(result: unknown, nodeId: string) {
  if (!result || typeof (result as { then?: unknown }).then !== 'function') return

  void Promise.resolve(result).then(
    () => {
      const node = graphNodes.get(nodeId)
      if (!node || node.status !== 'open') return
      node.status = 'closed'
      flushTelemetry()
    },
    () => {
      const node = graphNodes.get(nodeId)
      if (!node) return
      node.status = 'aborted'
      flushTelemetry()
    },
  )
}

function isStream(value: unknown): value is StreamTarget {
  return value instanceof StreamConstructor
}

function formatOperator(name: string, arguments_: unknown[]) {
  if (name === 'merge') {
    const options = arguments_[0]
    const configuration =
      options && typeof options === 'object' && !Array.isArray(options)
        ? (options as { concurrency?: unknown; ordered?: unknown })
        : {}
    const concurrency = configuration.concurrency ?? Infinity
    const mode = configuration.ordered === true ? 'ordered' : 'unordered'
    return `merge(${String(concurrency)}, ${mode})`
  }
  if (name === 'rateLimit') {
    const options = arguments_[0]
    if (options && typeof options === 'object' && !Array.isArray(options)) {
      const { interval, limit } = options as { interval?: unknown; limit?: unknown }
      return `rateLimit(${String(limit ?? '')} / ${String(interval ?? '')} ms)`
    }
    return name
  }
  if (['slice', 'split'].includes(name)) {
    return `${name}(${arguments_.map(String).join(', ')})`
  }
  if (
    ['batch', 'decode', 'drop', 'encode', 'makeAsync', 'pluck', 'take', 'throttle'].includes(name)
  ) {
    return `${name}(${String(arguments_[0] ?? '')})`
  }
  if (['groupBy', 'keyBy', 'sortedGroupBy'].includes(name) && typeof arguments_[0] !== 'function') {
    return `${name}(${String(arguments_[0] ?? '')})`
  }
  return name
}

function addNode(
  type: GraphNode['type'],
  label: string,
  depth: number,
  metric?: GraphNode['metric'],
) {
  const id = `node-${nextNodeId++}`
  graphNodes.set(id, {
    id,
    type,
    label,
    depth,
    input: 0,
    output: 0,
    active: 0,
    ready: 0,
    errors: 0,
    status: 'open',
    metric,
  })
  flushTelemetry()
  return id
}

function addEdge(from: string, to: string, trackFlow = false) {
  const existing = graphEdges.find((edge) => edge.from === from && edge.to === to)
  if (existing) return existing

  const edge: GraphEdge = {
    id: `edge-${nextEdgeId++}`,
    from,
    to,
    ...(trackFlow ? { flowed: 0 } : {}),
  }
  graphEdges.push(edge)
  flushTelemetry()
  return edge
}

function scheduleTelemetry() {
  if (telemetryTimer) return
  telemetryTimer = setTimeout(flushTelemetry, 100)
}

function occupiedSlots(node: GraphNode | undefined) {
  if (!node || node.capacity === undefined) return 0
  return Math.max(0, node.input - node.output - node.errors)
}

function flushTelemetry() {
  if (telemetryTimer) {
    clearTimeout(telemetryTimer)
    telemetryTimer = undefined
  }

  send({
    type: 'graph',
    nodes: Array.from(graphNodes.values(), (node) => ({
      ...node,
      window: occupiedSlots(node),
    })),
    edges: graphEdges.map((edge) => {
      const from = graphNodes.get(edge.from)
      const to = graphNodes.get(edge.to)
      const flowed = edge.flowed ?? to?.input ?? 0
      const produced = edge.produced ?? from?.output ?? 0
      const queued = Math.max(0, produced - flowed)
      const closed = to?.status !== 'open' || (from?.status !== 'open' && queued === 0)
      const occupied = occupiedSlots(to)
      const paused = !closed && to?.capacity !== undefined && occupied >= to.capacity
      return {
        ...edge,
        flowed,
        queued: closed ? 0 : queued,
        paused,
        closed,
      }
    }),
  })
}

function resetRuntime(configurations: DestinationConfig[]) {
  if (telemetryTimer) clearTimeout(telemetryTimer)
  if (consoleTimer) clearTimeout(consoleTimer)
  graphNodes = new Map()
  graphEdges = []
  destinations = new Map(
    configurations.map((configuration) => [
      configuration.name,
      { ...configuration, count: 0, values: [], state: 'idle' as const },
    ]),
  )
  eventSources = new Map()
  sourceLabels = new WeakMap()
  forkStates = new WeakMap()
  proxyTargets = new WeakMap()
  proxyNodeIds = new WeakMap()
  writableDestinations = new WeakMap()
  nextNodeId = 1
  nextEdgeId = 1
  telemetryTimer = undefined
  consoleTimer = undefined
  consoleEntries = []
  runStartedAt = performance.now()
}

function configureDestination(message: ConfigureDestinationMessage) {
  const runtime = destinations.get(message.name)
  if (!runtime) return

  runtime.delay = Math.min(10_000, Math.max(0, Math.round(message.delay)))
  runtime.wakeDelay?.()
}

function formatArgument(value: unknown) {
  if (value instanceof Error) return `${value.name}: ${value.message}`
  if (typeof value === 'string') return value
  if (value === undefined || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

const playgroundConsole = {
  log: (...arguments_: unknown[]) => sendConsole('log', arguments_),
  info: (...arguments_: unknown[]) => sendConsole('info', arguments_),
  warn: (...arguments_: unknown[]) => sendConsole('warn', arguments_),
  error: (...arguments_: unknown[]) => sendConsole('error', arguments_),
}

function sendConsole(level: ConsoleLevel, arguments_: unknown[]) {
  consoleEntries.push({
    level,
    message: arguments_.map(formatArgument).join(' '),
    elapsed: performance.now() - runStartedAt,
  })
  if (consoleEntries.length > 500) consoleEntries.shift()
  if (consoleTimer) return
  consoleTimer = setTimeout(flushConsole, 100)
}

function flushConsole() {
  if (consoleTimer) clearTimeout(consoleTimer)
  consoleTimer = undefined
  if (consoleEntries.length === 0) return
  send({ type: 'console', entries: consoleEntries })
  consoleEntries = []
}

self.addEventListener('message', async (event: MessageEvent<PlaygroundMessage>) => {
  if (event.data.type === 'source:event') {
    eventSources
      .get(event.data.name)
      ?.dispatchEvent(new CustomEvent(event.data.name, { detail: event.data.value }))
    return
  }

  if (event.data.type === 'destination:configure') {
    configureDestination(event.data)
    return
  }

  if (event.data.type !== 'run') return

  resetRuntime(event.data.destinations)
  send({ type: 'started' })

  try {
    const execute = new AsyncFunction(
      'exstream',
      'source',
      'destination',
      'console',
      `"use strict";\n${event.data.code}\n//# sourceURL=exstream-playground.js`,
    )

    await execute(instrumentedExstream, source, destination, playgroundConsole)
    for (const runtime of destinations.values()) sendDestinationSnapshot(runtime)
    flushConsole()
    flushTelemetry()
    send({ type: 'complete' })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined
    flushConsole()
    flushTelemetry()
    send({ type: 'error', message, stack })
  }
})
