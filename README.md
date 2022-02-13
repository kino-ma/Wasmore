# Wasmore - measurement branch

In this branch, we measure performance of Wasmore.

**Wasmore** gives FaaS computing _more_ speed, with _Wasm_.

Prototype implementation of my research, which make FaaS computing faster by combinating WebAssembly and container.

## Measurement

We measured the performance of _container only_, _WebAssembly only_, and _proposed method_.

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
## /light-task ##
  454421 μs
   74647 μs
   91159 μs
   90311 μs
   83320 μs
   82825 μs
   53553 μs
   53629 μs
   66372 μs
   79607 μs
average:    112984 μs
min:         53553 μs
max:        454421 μs

## /heavy-task ##
 3466021 μs
 3129552 μs
 3132002 μs
 3098389 μs
 3131315 μs
 3151764 μs
 3135154 μs
 3198065 μs
 3121635 μs
 3131419 μs
average:   3169532 μs
min:       3098389 μs
max:       3466021 μs
```

## WebAssembly only

```
## /light-task ##
   99489 μs
    5675 μs
    2865 μs
    7282 μs
    5819 μs
    9605 μs
    6950 μs
    3237 μs
   11266 μs
   11624 μs
average:     16381 μs
min:          2865 μs
max:         99489 μs

## /heavy-task ##
 6620363 μs
 6507728 μs
 6488111 μs
 6484653 μs
 6484774 μs
 6485004 μs
 6466617 μs
 6473206 μs
 6532166 μs
 6524304 μs
average:   6506693 μs
min:       6466617 μs
max:       6620363 μs
```
