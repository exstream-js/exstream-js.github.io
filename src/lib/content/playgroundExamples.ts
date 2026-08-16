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
    code: `const highValueOrders = exstream(source('transactions'))
  .filter((transaction) => transaction.amount >= 5000)
  .map(({ id, customer, product, amount }) => ({
    id,
    customer,
    product,
    amount,
  }))
  .batch(10)
  .flatMap((batch) => batch)
  .take(60)

await highValueOrders.pipeTo(destination('high-value'))`,
  },
  'async-work': {
    title: 'Async work and order',
    sourcePath: '/docs/learn/async-work/',
    description: AsyncWorkDescription,
    code: `const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

const enriched = exstream(source('transactions'))
  .take(40)
  .mapAsync(
    async (transaction) => {
      const latency = 30 + (Number(transaction.id.slice(-2)) % 5) * 35
      await wait(latency)
      return { ...transaction, latency }
    },
    { concurrency: 8, ordered: false },
  )

await enriched.pipeTo(destination('enriched'))`,
  },
  consume: {
    title: 'Consume a pipeline',
    sourcePath: '/docs/learn/consume/',
    description: ConsumeDescription,
    code: `const pipeline = exstream(source('transactions'))
  .filter((transaction) => transaction.amount >= 7500)
  .take(30)
  .tap((transaction) => {
    console.log('accepted', transaction.id, transaction.amount)
  })

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
  primary.pipeTo(destination('primary')),
  audit.pipeTo(destination('slow-audit')),
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
  approved.pipeTo(destination('approved')),
  review.pipeTo(destination('manual-review')),
])`,
  },
  'merge-sources': {
    title: 'Merge sources',
    sourcePath: '/docs/reference/merge/',
    description: MergeSourcesDescription,
    code: `const web = exstream(source('transactions'))
  .take(60)
  .map((transaction) => ({ ...transaction, lane: 'web' }))

const retail = exstream(source('transactions'))
  .take(60)
  .map((transaction) => ({ ...transaction, lane: 'retail' }))

const transactions = exstream([web, retail])
  .merge(2, false)

await transactions.pipeTo(destination('all-transactions'))`,
  },
  errors: {
    title: 'Errors and lifecycle',
    sourcePath: '/docs/learn/errors/',
    description: ErrorsDescription,
    code: `const validated = exstream(source('transactions'))
  .take(120)
  .map((transaction) => {
    const sequence = Number(transaction.id.slice(-2))

    if (sequence % 17 === 0) {
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
  retryable: error.code === 'RISK_TIMEOUT',
  input,
}))

const retryable = failures
  .fork()
  .filter((failure) => failure.retryable)

const rejected = failures
  .fork()
  .filter((failure) => !failure.retryable)

await Promise.all([
  output.pipeTo(destination('processed')),
  retryable.pipeTo(destination('retry-queue')),
  rejected.pipeTo(destination('dead-letter')),
])`,
  },
} satisfies Record<string, PlaygroundExample>

export type PlaygroundExampleId = keyof typeof playgroundExamples

export function getPlaygroundExample(id: string | null | undefined) {
  if (!id || !(id in playgroundExamples)) return undefined
  return playgroundExamples[id as PlaygroundExampleId]
}
