# Merge two live sources

Two independent transaction generators are transformed into labeled lanes and then consumed by a single `merge(2, false)` node.

The concurrency bound allows both inputs to make progress. With unordered output, the destination receives whichever lane produces its next value first.

Change the merge concurrency or add asynchronous work to one lane and watch the per-input counters diverge.
