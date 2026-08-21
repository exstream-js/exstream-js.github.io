# Compose reusable pieces

`normalizeTransaction` is a reusable pipeline recipe. `addReviewBand` is a parameter-free operator function. `through()` attaches both forms to the live stream without changing their behavior.

The graph represents each `through()` call as a composition boundary. The operators inside `normalizeTransaction` get fresh state every time that pipeline is attached.

Change the normalization pipeline, or turn `addReviewBand` into a parameterized function and pass the chosen threshold when attaching it.
