# Wasmore - measurement branch
In this branch, we measure performance of Wasmore.

**Wasmore** gives FaaS computing *more* speed, with *Wasm*.

Prototype implementation of my research, which make FaaS computing faster by combinating WebAssembly and container.

## Measurement
We measured the performance of *container only*, *WebAssembly only*, and *proposed method*.

`bench/bench.py` was used for each.

We modify only `server/invoker.js` to change the measured method. See each tagged commit to refer to source codes at the measured time.


## Proposed method


## Container only


## WebAssembly only