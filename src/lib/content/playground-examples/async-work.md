# Concurrent enrichment

Each transaction waits between two and three seconds for a simulated remote risk check. `concurrency: 8` fills the `mapAsync` window but never allows a ninth callback to start. While the window is full, the incoming edge shows that upstream is paused.

As each request finishes, `ordered: false` emits the enriched transaction and starts the next check. Shorter requests can overtake earlier records. The destination runs at maximum speed so its own delay does not affect completion order.

Switch `ordered` to `true` to restore input order.
