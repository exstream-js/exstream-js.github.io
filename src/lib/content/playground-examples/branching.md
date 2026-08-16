# One source, two delivery contracts

The shared transaction stream is forked into an `approved` branch and a `manual-review` branch. Each transaction is classified and delivered to exactly one destination.

Because both forks are reliable, either writer may apply backpressure to the common source.

Slow down `manual-review` and watch the waiting count appear before its filter.
