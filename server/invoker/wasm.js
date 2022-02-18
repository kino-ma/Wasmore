const { ReusableInvoker } = require("./invoker");
const { spawn, Thread, Worker } = require("threads");
const { measure } = require("../../utils/perf");

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
    measure("wasm worker init", () => this.worker.run("hello", "thread"));
  }

  async _fin() {
    await Thread.terminate(this.worker);
  }

  async _invoke(input) {
    if (this.worker === null) {
      throw new Error("Worker is not initialized yet.");
    }

    return this.worker.run(this.funcName, input);
  }
}

module.exports = {
  WasmInvoker,
};
