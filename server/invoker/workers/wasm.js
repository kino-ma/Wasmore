const { expose } = require("threads/worker");
const { VM } = require("vm2");

const wasm = require("faas-app");

wasm["light_task"](92);

expose({
  run(funcName, input) {
    // const globalObject = {
    //   func: wasm[funcName],
    //   arg: input,
    // };

    // const vm = new VM({
    //   sandbox: globalObject,
    // });

    // return vm.run("func(arg)");
    return wasm[funcName](input);
  },
});
