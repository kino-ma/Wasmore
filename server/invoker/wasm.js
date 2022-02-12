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

expose({
  invokers: {},

  addModule(name, func) {
    const invoker = new WasmInvoker(func);
    this.invokers[name] = invoker;
  },

  runModule(name, input) {
    if (!name in this.invokers) {
      throw new Error(`no such ContainerInvoker: ${name}`);
    }

    const invoker = this.invokers[name];
    return invoker.run(input);
  },
});

module.exports = {
  WasmInvoker,
};
