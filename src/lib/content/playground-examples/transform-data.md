# Settlement batches

This pipeline keeps transactions above the settlement floor, normalizes their monetary value to cents, and groups 120 accepted records into batches of 20.

The final `map()` turns each batch into a settlement summary. Watch how the graph changes from individual transactions to six destination records.

Only the current batch is retained; the complete source is not collected.
