# Description first, execution later

`map()` and `filter()` build a lazy pipeline. No transaction moves until the final `pipeTo()` attaches a consumer and owns its completion.

The live graph makes that model visible: values travel from the source through both operators, while the destination supplies demand in the opposite direction.

Change the amount threshold and compare the `in`, `out`, and `dropped` counters.
