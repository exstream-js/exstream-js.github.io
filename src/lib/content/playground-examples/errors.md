# Retry, then route remaining failures

This example creates two record-error classes. A simulated risk timeout is transient; invalid customer data is permanent.

`mapAsync()` retries only `RISK_TIMEOUT` failures, up to two additional attempts, while retaining the record's concurrency slot. Invalid customer data is not retried.

After retry policy finishes, `routeErrors()` splits successful records into `output` and remaining record errors into structured `{ error, input }` dead letters. Both reliable branches are consumed concurrently.

Unhandled record errors would reject a terminal instead. Fatal graph, destination, lifecycle, and cancellation failures bypass the dead-letter route.
