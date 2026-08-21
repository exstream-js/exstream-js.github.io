export const homeExampleCode = `const response = await fetch('/data/orders.json')
if (!response.ok) throw new Error(\`HTTP \${response.status}\`)

const orders = exstream(response.body)
  .json({ path: '$.orders[*]' })
  .mapAsync(
    async (order) => ({
      ...order,
      priority: order.total >= 750 ? 'high' : 'normal',
    }),
    { concurrency: 8 },
  )
  .filter((order) => order.status === 'active')

await orders
  .jsonlStringify()
  .pipeTo(destination('active-orders', { speed: 50 }))`
