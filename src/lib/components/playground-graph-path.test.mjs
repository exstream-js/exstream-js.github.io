import assert from 'node:assert/strict'
import test from 'node:test'

import { routeGraphEdge } from './playground-graph-path.js'

test('keeps a direct curve when no card blocks the edge', () => {
  const route = routeGraphEdge({
    x1: 0,
    y1: 50,
    x2: 300,
    y2: 50,
    height: 200,
    obstacles: [],
  })

  assert.equal(route.path, 'M 0 50 C 144 50, 156 50, 300 50')
  assert.equal(route.labelY, 50)
})

test('routes a long edge above an intermediate card', () => {
  const route = routeGraphEdge({
    x1: 0,
    y1: 100,
    x2: 300,
    y2: 100,
    height: 240,
    obstacles: [{ left: 110, right: 190, top: 70, bottom: 130 }],
  })

  assert.match(route.path, / L /)
  assert.equal(route.labelY, 42)
})

test('does not detour around a card outside the edge path', () => {
  const route = routeGraphEdge({
    x1: 0,
    y1: 150,
    x2: 300,
    y2: 150,
    height: 240,
    obstacles: [{ left: 110, right: 190, top: 20, bottom: 80 }],
  })

  assert.doesNotMatch(route.path, / L /)
})

test('routes below when there is not enough room above', () => {
  const route = routeGraphEdge({
    x1: 0,
    y1: 35,
    x2: 300,
    y2: 35,
    height: 240,
    obstacles: [{ left: 110, right: 190, top: 5, bottom: 65 }],
  })

  assert.equal(route.labelY, 93)
})
