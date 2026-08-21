import assert from 'node:assert/strict'
import test from 'node:test'

import { nextDestinationDeadline } from './destination-clock.js'

test('schedules the first write one interval from now', () => {
  assert.equal(nextDestinationDeadline(undefined, 100, 5), 105)
})

test('does not accumulate small timer overshoots', () => {
  let deadline
  let now = 0

  for (let index = 0; index < 200; index += 1) {
    deadline = nextDestinationDeadline(deadline, now, 5)
    now = deadline + 1.2
  }

  assert.equal(deadline, 1_000)
})

test('catches up after ordinary browser timer jitter', () => {
  assert.equal(nextDestinationDeadline(50, 61, 5), 55)
})

test('rebases the schedule after a long stall', () => {
  assert.equal(nextDestinationDeadline(50, 200, 5), 205)
})
