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

    return await vm.run("func(arg)");
  }
}

module.exports = {
  WasmInvoker,
};
