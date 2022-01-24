# Wasmore - measurement branch
In this branch, we measure performance of Wasmore.

**Wasmore** gives FaaS computing *more* speed, with *Wasm*.

Prototype implementation of my research, which make FaaS computing faster by combinating WebAssembly and container.

## Measurement
We measured the performance of *container only*, *WebAssembly only*, and *proposed method*.

`bench/bench.py` was used for each.

We modify only `server/invoker.js` to change the measured method. See each tagged commit to refer to source codes at the measured time.


## Proposed method
```
## light ##
   14915 μs
   72069 μs
   79854 μs
   57958 μs
   74453 μs
   55488 μs
   88129 μs
   91628 μs
   63127 μs
   63502 μs
average:     66112 μs
min:         14915 μs
max:         91628 μs

## heavy ##
 6473410 μs
 3137558 μs
 3108223 μs
 3125527 μs
 3081522 μs
 3134323 μs
 3104709 μs
 3136493 μs
 3091345 μs
 3115657 μs
average:   3450877 μs
min:       3081522 μs
max:       6473410 μs
```

## Container only


## WebAssembly only