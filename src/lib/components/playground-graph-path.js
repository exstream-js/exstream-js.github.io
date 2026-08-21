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

  const corridor = obstacles.filter((obstacle) => obstacle.left < x2 && obstacle.right > x1)
  const clearance = 28
  const above = Math.min(...corridor.map((obstacle) => obstacle.top)) - clearance
  const below = Math.max(...corridor.map((obstacle) => obstacle.bottom)) + clearance
  const aboveCost = above >= 0 ? Math.abs(y1 - above) + Math.abs(y2 - above) : Infinity
  const belowCost = below <= height ? Math.abs(y1 - below) + Math.abs(y2 - below) : Infinity
  if (!Number.isFinite(aboveCost) && !Number.isFinite(belowCost)) return defaultRoute

  const detourY = aboveCost <= belowCost ? above : below
  const turn = Math.min(36, Math.max(18, (x2 - x1) / 6))

  return {
    path: [
      `M ${x1} ${y1}`,
      `C ${x1 + turn / 2} ${y1}, ${x1 + turn / 2} ${detourY}, ${x1 + turn} ${detourY}`,
      `L ${x2 - turn} ${detourY}`,
      `C ${x2 - turn / 2} ${detourY}, ${x2 - turn / 2} ${y2}, ${x2} ${y2}`,
    ].join(' '),
    labelX: x1 + (x2 - x1) / 2,
    labelY: detourY,
  }
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
