# Bounded asynchronous work

Each transaction waits for a simulated remote enrichment. `concurrency: 8` allows at most eight callbacks to be active at once.

`ordered: false` emits completed work immediately, so records with shorter simulated latency can overtake earlier records.

Switch it to `true` and observe how input order is restored, even when later work finishes first.
