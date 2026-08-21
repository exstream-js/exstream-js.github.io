# Rejoin fast and slow lanes

A single transaction stream is split into two useful paths: routine payments are approved immediately, while high-value payments go through a slower asynchronous risk check.

`merge({ concurrency: 2, ordered: false })` consumes both branches together and reunites their decisions in one destination. Routine approvals keep flowing while the risk engine works, and reviewed payments are emitted as soon as each check finishes.

Switch `ordered` to `true` to compare that behavior with emitting the complete routine lane before the reviewed lane.
