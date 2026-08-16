export const docsNavigation = [
  {
    label: 'Overview',
    items: [{ href: '/docs/', label: 'Choose a path' }],
  },
  {
    label: 'Learn',
    items: [
      { href: '/docs/project/when-not-to-use/', label: 'When to use Exstream' },
      { href: '/docs/learn/sources/', label: 'Create a source' },
      { href: '/docs/learn/pipeline-model/', label: 'Pipeline model' },
      { href: '/docs/learn/transform-data/', label: 'Transform data' },
      { href: '/docs/learn/async-work/', label: 'Async work & order' },
      { href: '/docs/learn/consume/', label: 'Consume a pipeline' },
      { href: '/docs/concepts/backpressure/', label: 'Backpressure' },
      { href: '/docs/learn/branching/', label: 'Branch & observe' },
      { href: '/docs/learn/errors/', label: 'Errors & lifecycle' },
    ],
  },
  {
    label: 'Guides',
    items: [{ href: '/docs/examples/browser-csv/', label: 'Fetch a large CSV' }],
  },
  {
    label: 'API reference',
    items: [{ href: '/docs/reference/', label: 'Operator index' }],
  },
  {
    label: 'API · Transform',
    items: [
      { href: '/docs/reference/map/', label: 'map()' },
      { href: '/docs/reference/filter/', label: 'filter()' },
      { href: '/docs/reference/flat-map/', label: 'flatMap()' },
      { href: '/docs/reference/tap/', label: 'tap()' },
      { href: '/docs/reference/batch/', label: 'batch()' },
      { href: '/docs/reference/collect/', label: 'collect()' },
      { href: '/docs/reference/through/', label: 'through()' },
    ],
  },
  {
    label: 'API · Async',
    items: [
      { href: '/docs/reference/map-async/', label: 'mapAsync()' },
      { href: '/docs/reference/resolve/', label: 'resolve()' },
    ],
  },
  {
    label: 'API · Graph',
    items: [
      { href: '/docs/reference/fork/', label: 'fork()' },
      { href: '/docs/reference/observe/', label: 'observe()' },
      { href: '/docs/reference/merge/', label: 'merge()' },
    ],
  },
  {
    label: 'API · Errors',
    items: [
      { href: '/docs/reference/errors/', label: 'errors()' },
      { href: '/docs/reference/skip-errors/', label: 'skipErrors()' },
      { href: '/docs/reference/route-errors/', label: 'routeErrors()' },
    ],
  },
  {
    label: 'API · Formats',
    items: [
      { href: '/docs/reference/csv/', label: 'csv()' },
      { href: '/docs/reference/csv-stringify/', label: 'csvStringify()' },
      { href: '/docs/reference/json/', label: 'json()' },
      { href: '/docs/reference/json-stringify/', label: 'jsonStringify()' },
      { href: '/docs/reference/jsonl/', label: 'jsonl()' },
      { href: '/docs/reference/jsonl-stringify/', label: 'jsonlStringify()' },
    ],
  },
  {
    label: 'API · Consume',
    items: [
      { href: '/docs/reference/pipe-to/', label: 'pipeTo()' },
      { href: '/docs/reference/to-async-iterator/', label: 'toAsyncIterator()' },
      { href: '/docs/reference/drain/', label: 'drain()' },
    ],
  },
] as const
