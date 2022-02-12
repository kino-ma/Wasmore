const { expose } = "threads";
const { VM } = require("vm2");

const wasm = require("faas-app");

expose({
  run(funcName, input) {
    const globalObject = {
      func: wasm[funcName],
      arg: input,
    };

    const vm = new VM({
      sandbox: globalObject,
    });

    return vm.run("func(arg)");
  },
});
