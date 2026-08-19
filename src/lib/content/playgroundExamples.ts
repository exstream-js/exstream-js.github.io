import type { Component } from 'svelte'
import AsyncWorkDescription from './playground-examples/async-work.md'
import BackpressureDescription from './playground-examples/backpressure.md'
import BranchingDescription from './playground-examples/branching.md'
import ConsumeDescription from './playground-examples/consume.md'
import ErrorsDescription from './playground-examples/errors.md'
import MergeSourcesDescription from './playground-examples/merge-sources.md'
import PipelineModelDescription from './playground-examples/pipeline-model.md'
import SourcesDescription from './playground-examples/sources.md'
import TransformDataDescription from './playground-examples/transform-data.md'

type PlaygroundExample = {
  title: string
  sourcePath: string
  description: Component
  code: string
}

export const playgroundExamples = {
  sources: {
    title: 'Create a source',
    sourcePath: '/docs/learn/sources/',
    description: SourcesDescription,
    code: `const transactions = exstream(source('transactions'))
  .take(40)

await transactions.pipeTo(destination('transactions'))`,
  },
  'pipeline-model': {
    title: 'Pipeline model',
    sourcePath: '/docs/learn/pipeline-model/',
    description: PipelineModelDescription,
    code: `const activeOrders = exstream(source('transactions'))
  .map((transaction) => ({
    ...transaction,
    active: transaction.amount >= 2500,
  }))
  .filter((transaction) => transaction.active)
  .take(60)

await activeOrders.pipeTo(destination('active-orders'))`,
  },
  'transform-data': {
    title: 'Transform data',
    sourcePath: '/docs/learn/transform-data/',
    description: TransformDataDescription,
    code: `const settlementBatches = exstream(source('transactions'))
  .filter((transaction) => transaction.amount >= 1000)
  .map((transaction) => ({
    ...transaction,
    amountInCents: Math.round(transaction.amount * 100),
  }))
  .take(120)
  .batch(20)
  .map((transactions) => ({
    firstId: transactions[0].id,
    lastId: transactions.at(-1).id,
    count: transactions.length,
    totalInCents: transactions.reduce(
      (total, transaction) => total + transaction.amountInCents,
      0,
    ),
  }))

await settlementBatches.pipeTo(destination('settlement-batches'))`,
  },
  'async-work': {
    title: 'Async processing',
    sourcePath: '/docs/learn/async-work/',
    description: AsyncWorkDescription,
    code: `const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const enriched = exstream(source('transactions'))
  .take(40)
  .mapAsync(
    async (transaction) => {
      const latency = 2_000 + Math.round(Math.random() * 1_000)
      await wait(latency)
      return {
        ...transaction,
        risk: transaction.amount >= 7500 ? 'review' : 'clear',
        latency,
      }
    },
    { concurrency: 8, ordered: false },
  )

await enriched.pipeTo(destination('enriched', { speed: Infinity }))`,
  },
  consume: {
    title: 'Consume a pipeline',
    sourcePath: '/docs/learn/consume/',
    description: ConsumeDescription,
    code: `const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

// Building the chain does not read from the source.
const pipeline = exstream(source('transactions'))
  .filter((transaction) => transaction.amount >= 7500)
  .take(30)
  .tap((transaction) => {
    console.log('accepted', transaction.id, transaction.amount)
  })

// Nothing flows during this second: the pipeline is still lazy.
await wait(1000)

// This terminal call creates demand and starts draining the pipeline.
await pipeline.pipeTo(destination('processed'))`,
  },
  backpressure: {
    title: 'Backpressure',
    sourcePath: '/docs/concepts/backpressure/',
    description: BackpressureDescription,
    code: `const transactions = exstream(source('transactions'))
  .take(200)

const primary = transactions.fork()
const audit = transactions.fork()

await Promise.all([
  primary.take(130).pipeTo(destination('primary', { speed: 5 })),
  audit.slice(100).pipeTo(destination('slow-audit', { speed: 1 })),
])`,
  },
  branching: {
    title: 'Branch and observe',
    sourcePath: '/docs/learn/branching/',
    description: BranchingDescription,
    code: `const transactions = exstream(source('transactions'))
  .take(200)

const approved = transactions
  .fork()
  .filter((transaction) => transaction.amount < 5000)

const review = transactions
  .fork()
  .filter((transaction) => transaction.amount >= 5000)

await Promise.all([
  approved.pipeTo(destination('approved', { speed: 20 })),
  review.pipeTo(destination('manual-review', { speed: 5 })),
])`,
  },
  'merge-sources': {
    title: 'Rejoin processing lanes',
    sourcePath: '/docs/reference/merge/',
    description: MergeSourcesDescription,
    code: `const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const transactions = exstream(source('transactions'))
  .take(120)

const routine = transactions
  .fork()
  .filter((transaction) => transaction.amount < 7500)
  .map((transaction) => ({
    ...transaction,
    decision: 'approved',
    reviewedBy: 'rules',
  }))

const highRisk = transactions
  .fork()
  .filter((transaction) => transaction.amount >= 7500)
  .mapAsync(
    async (transaction) => {
      await wait(250 + Math.round(Math.random() * 500))
      return {
        ...transaction,
        decision: transaction.amount >= 9000 ? 'held' : 'approved',
        reviewedBy: 'risk-engine',
      }
    },
    { concurrency: 6, ordered: false },
  )

const decisions = exstream([routine, highRisk])
  .merge(2, false)

await decisions.pipeTo(destination('decisions', { speed: Infinity }))`,
  },
  errors: {
    title: 'Errors and lifecycle',
    sourcePath: '/docs/learn/errors/',
    description: ErrorsDescription,
    code: `const MAX_RETRIES = 2
const input = exstream(null, { bufferLimit: 256 })

let originalSourceEnded = false
let pending = 0
let closeScheduled = false

function closeInputWhenIdle() {
  if (!originalSourceEnded || pending !== 0 || closeScheduled) return

  closeScheduled = true
  queueMicrotask(() => {
    closeScheduled = false
    if (originalSourceEnded && pending === 0 && !input.ended) input.end()
  })
}

function settle() {
  pending -= 1
  closeInputWhenIdle()
}

async function seedInput() {
  let count = 0

  for await (const transaction of source('transactions')) {
    pending += 1
    input.write({ ...transaction, attempt: 0 })
    count += 1

    if (count === 120) break
  }

  originalSourceEnded = true
  closeInputWhenIdle()
}

const validated = input
  .map((transaction) => {
    const sequence = Number(transaction.id.slice(-2))

    if (sequence % 17 === 0 && transaction.attempt < MAX_RETRIES) {
      const error = new Error('Risk service timed out')
      error.code = 'RISK_TIMEOUT'
      throw error
    }

    if (sequence % 11 === 0) {
      const error = new Error('Customer validation failed')
      error.code = 'INVALID_CUSTOMER'
      throw error
    }

    return { ...transaction, status: 'validated' }
  })

const { output, deadLetters } = validated.routeErrors()

const failures = deadLetters.map(({ error, input }) => ({
  code: error.code ?? 'UNKNOWN',
  message: error.message,
  retryable: error.code === 'RISK_TIMEOUT' && input.attempt < MAX_RETRIES,
  input,
}))

const retryable = failures
  .fork()
  .filter((failure) => failure.retryable)

const rejected = failures
  .fork()
  .filter((failure) => !failure.retryable)

await Promise.all([
  output
    .tap(settle)
    .pipeTo(destination('processed')),
  retryable
    .tap((failure) => {
      input.write({
        ...failure.input,
        attempt: failure.input.attempt + 1,
      })
    })
    .pipeTo(destination('retry-queue')),
  rejected
    .tap(settle)
    .pipeTo(destination('dead-letter')),
  seedInput(),
])`,
  },
} satisfies Record<string, PlaygroundExample>

export type PlaygroundExampleId = keyof typeof playgroundExamples

export function getPlaygroundExample(id: string | null | undefined) {
  if (!id || !(id in playgroundExamples)) return undefined
  return playgroundExamples[id as PlaygroundExampleId]
}
