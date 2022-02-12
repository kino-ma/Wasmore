const { VM } = require("vm2");

const { ReusableInvoker } = require("./invoker");

class WasmInvoker extends ReusableInvoker {
  constructor(funcName) {
    super();

    this._spawn();

    this.funcName = funcName;
    this.worker = null;
  }

  async _spawn(path = "./workers/wasm") {
    this.worker = spawn(new Worker(path));
  }

  async _invoke(input) {
    if (this.worker === null) {
      throw new Error("Worker is not initialized yet.");
    }

    return this.worker.run(this.funcName, input);
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
