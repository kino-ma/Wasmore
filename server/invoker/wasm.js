const { VM } = require("vm2");

const { ReusableInvoker } = require("./invoker");
const { measure } = require("../../utils/perf");

class WasmInvoker extends ReusableInvoker {
  constructor(func) {
    super();
    this.func = func;
  }

  async _invoke(input) {
    const globalObject = {
      func: this.func,
      arg: input,
    };

    const vm = new VM({
      sandbox: globalObject,
    });

    const { elapsed, result } = await measure("wasm", async () =>
      vm.run("func(arg)")
    );

    return { elapsed, result };
  }
}

module.exports = {
  WasmInvoker,
};