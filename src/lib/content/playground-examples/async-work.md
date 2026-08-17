# Fill the concurrency window

Each transaction waits between two and three seconds for a simulated remote enrichment. `concurrency: 8` quickly fills the `mapAsync` node to `active 8 / 8`, but never allows a ninth callback to start. While the window is full, the dashed incoming edge marks the upstream branch as paused rather than inventing records waiting in a queue.

As each request finishes, `ordered: false` emits that record immediately and starts the next waiting enrichment. Shorter requests can therefore overtake earlier records. The destination runs at maximum speed so it does not hide or reshape the completions coming out of `mapAsync`.

Switch it to `true` and observe how input order is restored, even when later work finishes first.
