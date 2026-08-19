export type OperatorTelemetry = {
  metric?: 'dropped' | 'errors'
  capacity?: 'mapAsync'
}

export const operatorTelemetry = {
  asyncFilter: { metric: 'dropped' },
  asyncReduce: { metric: 'errors' },
  batch: {},
  collect: {},
  compact: { metric: 'dropped' },
  consume: {},
  consumeSync: {},
  csv: { metric: 'errors' },
  csvStringify: { metric: 'errors' },
  decode: { metric: 'errors' },
  drop: { metric: 'dropped' },
  encode: { metric: 'errors' },
  errors: {},
  extendContext: { metric: 'errors' },
  failOnError: {},
  filter: { metric: 'dropped' },
  find: { metric: 'dropped' },
  findWhere: { metric: 'dropped' },
  flatMap: { metric: 'errors' },
  flatten: {},
  groupBy: { metric: 'errors' },
  head: { metric: 'dropped' },
  json: { metric: 'errors' },
  jsonStringify: { metric: 'errors' },
  jsonl: { metric: 'errors' },
  jsonlStringify: { metric: 'errors' },
  keyBy: { metric: 'errors' },
  last: { metric: 'dropped' },
  makeAsync: {},
  map: { metric: 'errors' },
  mapAsync: { capacity: 'mapAsync', metric: 'errors' },
  omit: { metric: 'errors' },
  pick: { metric: 'errors' },
  pluck: { metric: 'errors' },
  ratelimit: {},
  reduce: { metric: 'errors' },
  reduce1: { metric: 'errors' },
  reject: { metric: 'dropped' },
  skipErrors: {},
  slice: { metric: 'dropped' },
  sort: {},
  sortBy: { metric: 'errors' },
  sortedGroupBy: {},
  split: {},
  splitBy: {},
  stopOnError: {},
  stopWhen: {},
  take: { metric: 'dropped' },
  tap: {},
  throttle: { metric: 'dropped' },
  through: {},
  uniq: { metric: 'dropped' },
  uniqBy: { metric: 'dropped' },
  where: { metric: 'dropped' },
  withContext: { metric: 'errors' },
} as const satisfies Record<string, OperatorTelemetry>

export type InstrumentedOperator = keyof typeof operatorTelemetry

export const graphMethodNames = ['fork', 'merge', 'observe', 'routeErrors', 'sortedJoin'] as const

export const terminalMethodNames = ['drain', 'single', 'toArray'] as const
export const destinationMethodNames = ['pipeTo'] as const
export const adapterMethodNames = ['toWebReadable'] as const
export const lifecycleMethodNames = ['start'] as const

export const playgroundMethodNames = [
  ...Object.keys(operatorTelemetry),
  ...graphMethodNames,
  ...terminalMethodNames,
  ...destinationMethodNames,
  ...adapterMethodNames,
  ...lifecycleMethodNames,
] as const
