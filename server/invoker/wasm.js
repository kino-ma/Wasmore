const { ReusableInvoker } = require("./invoker");
const { spawn, Thread, Worker } = require("threads");
const wasm = require("faas-app");

class WasmInvoker extends ReusableInvoker {
  constructor(funcName) {
    super();

    this.funcName = funcName;
    this.worker = null;
  }

  async _spawn(path = "./workers/wasm") {
    this.worker = await spawn(new Worker(path));
  }

  async _init() {
    await this._spawn();
  }

  async _fin() {
    await Thread.terminate(this.worker);
  }

  async _invoke(input) {
    if (this.worker === null) {
      throw new Error("Worker is not initialized yet.");
    }

    return wasm[this.funcName](input);
    // return this.worker.run(this.funcName, input);
  }
}

module.exports = {
  WasmInvoker,
};
