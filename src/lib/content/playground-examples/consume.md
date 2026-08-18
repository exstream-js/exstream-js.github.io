# The terminal owns execution

The chain remains a description during the one-second wait. Only `pipeTo(destination('processed'))` supplies a terminal consumer and starts draining it.

The preceding `tap()` writes each accepted transaction to the playground **Console** tab. The terminal promise is awaited, so completion and failure have a clear owner.

Raise or lower the writer speed and watch the whole pipeline follow it.
