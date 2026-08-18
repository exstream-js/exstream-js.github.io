# Watch demand move between branches

Both branches are reliable forks, but they consume different windows of the same 200 transactions. `primary.take(130)` writes the first 130 records and then detaches. `audit.slice(100)` discards the first 100 records and writes the final 100.

The playground-only `destination(name, { speed })` option sets a writer's initial speed in records per second. Here `primary` starts at 5 rps and `slow-audit` at 1 rps, making each phase easy to observe. The sliders can still override either value before or during the run.

For the first 100 records, `slice(100)` discards the audit branch's values without writing them, so `primary` alone sets the source's 5 rps pace. From records 101 through 130, both destinations write and the common source adapts to the slower 1 rps audit writer. Then `take(130)` detaches `primary`, leaving the audit branch to finish the remaining 70 records at 1 rps.

The orange edge shows where demand is currently blocked. Records skipped by `slice` are counted as dropped by the operator, not queued in `slow-audit`.
