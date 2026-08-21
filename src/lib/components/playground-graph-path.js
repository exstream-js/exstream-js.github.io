/**
 * @typedef {{ left: number, right: number, top: number, bottom: number }} GraphObstacle
 */

/**
 * @param {{
 *   x1: number
 *   y1: number
 *   x2: number
 *   y2: number
 *   height: number
 *   obstacles: GraphObstacle[]
 * }} options
 */
export function routeGraphEdge({ x1, y1, x2, y2, height, obstacles }) {
  const defaultRoute = {
    path: curvedPath(x1, y1, x2, y2),
    labelX: x1 + (x2 - x1) * 0.52,
    labelY: y1 + (y2 - y1) * 0.52,
  }
  if (x2 <= x1) return defaultRoute

  const blockers = obstacles.filter((obstacle) => crossesObstacle(x1, y1, x2, y2, obstacle))
  if (blockers.length === 0) return defaultRoute

  const clearance = 28
  const turn = Math.min(36, Math.max(18, (x2 - x1) / 6))
  const above = Math.min(...blockers.map((obstacle) => obstacle.top)) - clearance
  const below = Math.max(...blockers.map((obstacle) => obstacle.bottom)) + clearance
  const aboveCost = detourIsClear(above, x1 + turn, x2 - turn, height, obstacles)
    ? Math.abs(y1 - above) + Math.abs(y2 - above)
    : Infinity
  const belowCost = detourIsClear(below, x1 + turn, x2 - turn, height, obstacles)
    ? Math.abs(y1 - below) + Math.abs(y2 - below)
    : Infinity
  const preferredDetour = aboveCost <= belowCost ? above : below
  const channelDetour = findFreeChannel(y1, y2, x1 + turn, x2 - turn, height, obstacles)
  const detourY = Number.isFinite(Math.min(aboveCost, belowCost)) ? preferredDetour : channelDetour
  if (detourY === undefined) return defaultRoute

  const labelX = Number.isFinite(Math.min(aboveCost, belowCost))
    ? x1 + (x2 - x1) / 2
    : labelBesideBlocker(x1, x2, blockers)

  return {
    path: [
      `M ${x1} ${y1}`,
      `C ${x1 + turn / 2} ${y1}, ${x1 + turn / 2} ${detourY}, ${x1 + turn} ${detourY}`,
      `L ${x2 - turn} ${detourY}`,
      `C ${x2 - turn / 2} ${detourY}, ${x2 - turn / 2} ${y2}, ${x2} ${y2}`,
    ].join(' '),
    labelX,
    labelY: detourY,
  }
}

/**
 * Finds a narrow but unobstructed horizontal channel when there is not enough
 * room to route around an entire row of cards.
 *
 * @param {number} y1
 * @param {number} y2
 * @param {number} left
 * @param {number} right
 * @param {number} height
 * @param {GraphObstacle[]} obstacles
 */
function findFreeChannel(y1, y2, left, right, height, obstacles) {
  const edgePadding = 8
  const obstaclePadding = 2
  const minimumGap = 8
  const intervals = obstacles
    .filter((obstacle) => obstacle.left < right && obstacle.right > left)
    .map((obstacle) => ({
      top: Math.max(edgePadding, obstacle.top - obstaclePadding),
      bottom: Math.min(height - edgePadding, obstacle.bottom + obstaclePadding),
    }))
    .sort((a, b) => a.top - b.top)

  /** @type {{ top: number, bottom: number }[]} */
  const merged = []
  for (const interval of intervals) {
    const previous = merged.at(-1)
    if (previous && interval.top <= previous.bottom) {
      previous.bottom = Math.max(previous.bottom, interval.bottom)
    } else {
      merged.push({ ...interval })
    }
  }

  /** @type {number[]} */
  const candidates = []
  let cursor = edgePadding
  for (const interval of merged) {
    if (interval.top - cursor >= minimumGap) candidates.push((cursor + interval.top) / 2)
    cursor = Math.max(cursor, interval.bottom)
  }
  if (height - edgePadding - cursor >= minimumGap) {
    candidates.push((cursor + height - edgePadding) / 2)
  }

  return candidates.sort(
    (a, b) => Math.abs(y1 - a) + Math.abs(y2 - a) - Math.abs(y1 - b) - Math.abs(y2 - b),
  )[0]
}

/**
 * @param {number} x1
 * @param {number} x2
 * @param {GraphObstacle[]} blockers
 */
function labelBesideBlocker(x1, x2, blockers) {
  const firstLeft = Math.min(...blockers.map((obstacle) => obstacle.left))
  const lastRight = Math.max(...blockers.map((obstacle) => obstacle.right))
  const leftGap = firstLeft - x1
  const rightGap = x2 - lastRight
  return leftGap >= rightGap ? x1 + leftGap / 2 : lastRight + rightGap / 2
}

/**
 * @param {number} y
 * @param {number} left
 * @param {number} right
 * @param {number} height
 * @param {GraphObstacle[]} obstacles
 */
function detourIsClear(y, left, right, height, obstacles) {
  if (y < 0 || y > height) return false

  const margin = 8
  return obstacles.every(
    (obstacle) =>
      obstacle.left >= right ||
      obstacle.right <= left ||
      y < obstacle.top - margin ||
      y > obstacle.bottom + margin,
  )
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
function curvedPath(x1, y1, x2, y2) {
  const bend = Math.max(24, (x2 - x1) * 0.48)
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`
}

/**
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {GraphObstacle} obstacle
 */
function crossesObstacle(x1, y1, x2, y2, obstacle) {
  const left = Math.max(x1, obstacle.left)
  const right = Math.min(x2, obstacle.right)
  if (left >= right) return false

  const slope = (y2 - y1) / (x2 - x1)
  const leftY = y1 + (left - x1) * slope
  const rightY = y1 + (right - x1) * slope
  const minimumY = Math.min(leftY, rightY)
  const maximumY = Math.max(leftY, rightY)
  return maximumY >= obstacle.top && minimumY <= obstacle.bottom
}
