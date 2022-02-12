const { spawn, Worker } = require("threads");

const { ReusableInvoker } = require("./invoker");

class ContainerInvoker extends ReusableInvoker {
  constructor(task) {
    super();

    this._spawn();
    this.worker = null;
    this.task = task;
  }

  async _spawn(path = "./workers/container") {
    this.worker = spawn(new Worker(path));
  }

  async _invoke(input) {
    if (this.worker === null) {
      throw new Error("Worker is not initialized yet.");
    }

    return this.worker.run(input);
  }
}

module.exports = { ContainerInvoker };
