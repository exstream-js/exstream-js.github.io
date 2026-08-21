# Sample a hot mouse source

Press **Run**, then move the pointer anywhere over the page. The playground forwards real browser `mousemove` events to the worker as the hot `source('mousemove')` event target.

`fromEvent()` gives the non-pausable source a one-event buffer and drops the oldest buffered position on overflow. `throttle(200)` then keeps at most one leading position every 200 milliseconds and drops intermediate positions immediately.

The destination is intentionally unlimited: the dropped count belongs to `throttle()`, not to a slow writer. Remove `.throttle(200)` and run again to compare how many mouse positions arrive.

Mouse movement is open-ended, so the run remains active until you press **Stop**.
