# Reading the graph

The source produces transactions, `map()` and `filter()` transform the records, and `pipeTo()` connects the result to the destination.

The chain is lazy: no transaction moves until `pipeTo()` attaches the terminal consumer. The graph then shows values moving toward the destination and demand moving back toward the source.

Change the amount threshold and compare the `in`, `out`, and `dropped` counters.
