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
```
## light ##
  317061 μs
   82128 μs
   83275 μs
   69788 μs
   74841 μs
  101821 μs
   88525 μs
   85603 μs
   58003 μs
   57040 μs
average:    101808 μs
min:         57040 μs
max:        317061 μs

## heavy ##
 3302060 μs
 3140061 μs
 3127503 μs
 3102032 μs
 3119367 μs
 3058797 μs
 3098760 μs
 3097057 μs
 3123441 μs
 3113002 μs
average:   3128208 μs
min:       3058797 μs
max:       3302060 μs
```


## WebAssembly only
```
## light ##
   13185 μs
    3990 μs
    1395 μs
    2093 μs
     642 μs
    1933 μs
    3130 μs
    2094 μs
    1465 μs
     681 μs
average:      3061 μs
min:           642 μs
max:         13185 μs

## heavy ##
 6453087 μs
 6435628 μs
 6464875 μs
 6448786 μs
 6422618 μs
 6469658 μs
 6481462 μs
 6448382 μs
 6457363 μs
 6432250 μs
average:   6451411 μs
min:       6422618 μs
max:       6481462 μs
```