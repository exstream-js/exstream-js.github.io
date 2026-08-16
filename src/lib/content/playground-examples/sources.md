# An infinite async source

The playground provides `source('transactions')` as an **async generator**. It creates records only when the downstream pipeline asks for them.

`take(40)` gives this experiment a finite boundary. Remove it and the source will remain open until you press **Stop**.

Try slowing the destination down: demand travels upstream and the generator follows the writer's pace.
