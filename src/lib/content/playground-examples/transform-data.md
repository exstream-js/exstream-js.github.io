# Transform without collecting

This pipeline filters high-value transactions, reshapes them, groups them into batches of ten, and expands the batches back into individual records.

Watch how `batch(10)` changes the unit of flow: ten input records become one array. `flatMap()` performs the inverse expansion.

The complete source is never collected in memory.
