# Join sorted records

The inputs are already ordered by `id`. The left stream first removes duplicate tenant records, then `sortedJoin()` matches it incrementally with the labels on the right.

The join is a left join, so every remaining left record is emitted even when no matching label exists. Change one of the right-side IDs to see `right: null` in the destination.
