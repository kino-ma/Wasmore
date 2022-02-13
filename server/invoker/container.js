const { spawn, Thread, Worker } = require("threads");

const { ReusableInvoker } = require("./invoker");

class ContainerInvoker extends ReusableInvoker {
  constructor(task) {
    super();

    this.worker = null;
    this.task = task;
  }

  async _spawn(path = "./workers/container") {
    this.worker = await spawn(new Worker(path));
    await this.worker.init(["/root/faas_bin"]);
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

    return this.worker.run(this.task, input);
  }

  async isRunning() {
    return this.worker.isRunning();
  }
}

module.exports = { ContainerInvoker };
