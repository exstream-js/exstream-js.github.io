# Build an operator

`mapSimple` uses `consumeSync()` because it emits its result before the callback returns. `batchWithTimeOrCount` uses `consume()` because a timer may emit a pending batch later.

The paced source lets the timer win before the batch reaches ten records. Lower `count` to `3` to make the count limit win instead.

Try removing one `next()` call or the final `exstream.nil` push. The stalled graph makes each part of the low-level protocol visible.
