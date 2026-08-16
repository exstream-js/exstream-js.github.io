# Route failures without losing their input

Validation deliberately creates two recoverable failure classes. Exstream attaches each error to the transaction that caused it, and `routeErrors()` splits the flow into successful `output` and structured `deadLetters`.

The dead-letter envelope records the error code, message, original transaction, and whether the failure is safe to retry. A second reliable fork sends temporary failures to `retry-queue` and permanent failures to `dead-letter`.

All three destinations must be consumed concurrently. Slow down either failure writer and watch its backpressure travel through the routing graph.

Fatal source, sink, lifecycle, and cancellation failures never become dead letters. To see that boundary, replace `routeErrors()` with `failOnError()`.
