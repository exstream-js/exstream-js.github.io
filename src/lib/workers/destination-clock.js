/**
 * @param {number | undefined} previousDeadline
 * @param {number} now
 * @param {number} interval
 */
export function nextDestinationDeadline(previousDeadline, now, interval) {
  if (previousDeadline === undefined) return now + interval

  const scheduledDeadline = previousDeadline + interval
  const maximumLag = Math.max(100, interval)
  if (now - scheduledDeadline > maximumLag) return now + interval

  return scheduledDeadline
}
