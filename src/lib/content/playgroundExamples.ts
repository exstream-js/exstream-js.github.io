import type { Component } from 'svelte'
import AsyncWorkDescription from './playground-examples/async-work.md'
import BackpressureDescription from './playground-examples/backpressure.md'
import BranchingDescription from './playground-examples/branching.md'
import CompositionDescription from './playground-examples/composition.md'
import ConsumeDescription from './playground-examples/consume.md'
import ErrorsDescription from './playground-examples/errors.md'
import ExtensibilityDescription from './playground-examples/extensibility.md'
import MergeSourcesDescription from './playground-examples/merge-sources.md'
import OrdersPipelineDescription from './playground-examples/orders-pipeline.md'
import PipelineModelDescription from './playground-examples/pipeline-model.md'
import SourcesDescription from './playground-examples/sources.md'
import TransformDataDescription from './playground-examples/transform-data.md'
import { homeExampleCode } from './homeExample'

export type PlaygroundExample = {
  title: string
  sourcePath: string
  description: Component
  code: string
}

export const playgroundExamples = {
  'orders-pipeline': {
    title: 'Orders pipeline',
    sourcePath: '/',
    description: OrdersPipelineDescription,
    code: homeExampleCode,
  },
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
  composition: {
    title: 'Composition',
    sourcePath: '/docs/learn/composition/',
    description: CompositionDescription,
    code: `const normalizeTransaction = exstream
  .pipeline()
  .filter((transaction) => transaction.amount >= 1000)
  .map((transaction) => ({
    ...transaction,
    amountInCents: Math.round(transaction.amount * 100),
  }))

const addReviewBand = (stream) =>
  stream.map((transaction) => ({
    ...transaction,
    reviewBand: transaction.amount >= 7500 ? 'manual' : 'automatic',
  }))

const prepared = exstream(source('transactions'))
  .take(80)
  .through(normalizeTransaction)
  .through(addReviewBand)

await prepared.pipeTo(destination('prepared-transactions'))`,
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
    sourcePath: '/docs/learn/backpressure/',
    description: BackpressureDescription,
    code: `const mouseMoves = exstream
  .fromEvent(source('mousemove'), 'mousemove', {
    map: (event) => event.detail,
    highWaterMark: 1,
    overflow: 'drop-oldest',
  })
  .throttle(200)

await mouseMoves.pipeTo(
  destination('sampled-pointer', { speed: Infinity }),
)`,
  },
  branching: {
    title: 'Fork and observe',
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
    sourcePath: '/docs/learn/merge/',
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
    code: `const attempts = new Map()

const validated = exstream(source('transactions'))
  .take(120)
  .mapAsync(
    async (transaction) => {
      const attempt = (attempts.get(transaction.id) ?? 0) + 1
      attempts.set(transaction.id, attempt)
      const sequence = Number(transaction.id.slice(-2))

      if (sequence % 17 === 0 && attempt < 3) {
        const error = new Error('Risk service timed out')
        error.code = 'RISK_TIMEOUT'
        throw error
      }

      if (sequence % 11 === 0) {
        const error = new Error('Customer validation failed')
        error.code = 'INVALID_CUSTOMER'
        throw error
      }

      return { ...transaction, status: 'validated', attempt }
    },
    {
      concurrency: 8,
      retry: {
        retries: 2,
        when: (error) => error.code === 'RISK_TIMEOUT',
      },
    },
  )

const { output, deadLetters } = validated.routeErrors()

const rejected = deadLetters.map(({ error, input }) => ({
  code: error.code ?? 'UNKNOWN',
  message: error.message,
  attempts: attempts.get(input.id),
  input,
}))

await Promise.all([
  output.pipeTo(destination('processed')),
  rejected.pipeTo(destination('dead-letter')),
])`,
  },
  extensibility: {
    title: 'Extensibility',
    sourcePath: '/docs/learn/extensibility/',
    description: ExtensibilityDescription,
    code: `const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const mapSimple = (project) => (source) =>
  source.consumeSync((error, value, push) => {
    if (error) return push(error)
    if (value === exstream.nil) return push(null, exstream.nil)

    try {
      push(null, project(value))
    } catch (error) {
      push(error)
    }
  })

const batchWithTimeOrCount = ({ count, milliseconds }) => (source) => {
  let batch = []
  let emitBatch
  let timer

  const clearTimer = () => {
    if (timer !== undefined) clearTimeout(timer)
    timer = undefined
  }

  const flush = () => {
    if (batch.length === 0) return

    clearTimer()
    const values = batch
    const push = emitBatch
    batch = []
    emitBatch = undefined
    push(null, values)
  }

  const output = source.consume((error, value, push, next) => {
    if (error) {
      push(error)
      next()
      return
    }

    if (value === exstream.nil) {
      flush()
      push(null, exstream.nil)
      return
    }

    if (batch.length === 0) {
      emitBatch = push
      timer = setTimeout(flush, milliseconds)
    }

    batch.push(value)
    if (batch.length >= count) flush()
    next()
  })

  output.once('end', clearTimer)
  return output
}

async function* pacedTransactions(limit, delay) {
  let emitted = 0

  for await (const transaction of source('transactions')) {
    yield transaction
    emitted += 1
    if (emitted === limit) return
    await wait(delay)
  }
}

const batches = exstream(pacedTransactions(30, 60))
  .through(
    mapSimple((transaction) => ({
      ...transaction,
      amountInCents: Math.round(transaction.amount * 100),
    })),
  )
  .through(batchWithTimeOrCount({ count: 10, milliseconds: 250 }))

await batches.pipeTo(destination('batches', { speed: Infinity }))`,
  },
} satisfies Record<string, PlaygroundExample>

export type PlaygroundExampleId = keyof typeof playgroundExamples

export const playgroundExampleEntries = Object.entries(playgroundExamples) as Array<
  [PlaygroundExampleId, PlaygroundExample]
>

export function getPlaygroundExample(id: string | null | undefined) {
  if (!id || !(id in playgroundExamples)) return undefined
  return playgroundExamples[id as PlaygroundExampleId]
}
