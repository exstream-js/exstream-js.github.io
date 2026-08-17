# Retry through a finite work queue

Validation deliberately creates two recoverable failure classes. Exstream attaches each error to the transaction that caused it, and `routeErrors()` splits the flow into successful `output` and structured `deadLetters`.

The manual `work queue` receives 120 original transactions. Temporary failures are written back to that same input with an incremented attempt; permanent failures go to `dead-letter`. `retry-queue` makes every retry decision visible without removing it from the loop.

`pending` counts logical transactions, not attempts. A retry replaces its failed attempt, while a success or permanent rejection settles one transaction. Once the original source has ended and `pending` reaches zero, the queue closes and all three destinations finish naturally.

Retries are bounded to two attempts. In this simulation the transient timeout then succeeds; invalid customer data is rejected immediately. Fatal source, sink, lifecycle, and cancellation failures still bypass the dead-letter path.
