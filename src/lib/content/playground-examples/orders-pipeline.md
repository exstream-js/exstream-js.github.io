# Orders pipeline

This is the complete pipeline shown on the home page. It fetches a static JSON document, streams the `orders` array from the response body, enriches records concurrently, and keeps active orders.

The final `destination()` is provided by the playground. Its speed can be changed while the pipeline is running to see backpressure propagate to the fetched response.
