export const docsNavigation = [
  {
    label: 'Start here',
    items: [
      { href: '/docs/', label: 'Documentation' },
      { href: '/docs/quick-start/', label: 'Quick start' },
    ],
  },
  {
    label: 'Core concepts',
    items: [{ href: '/docs/concepts/backpressure/', label: 'Backpressure' }],
  },
  {
    label: 'Project',
    items: [
      {
        href: '/docs/project/when-not-to-use/',
        label: 'When not to use Exstream',
      },
    ],
  },
] as const
