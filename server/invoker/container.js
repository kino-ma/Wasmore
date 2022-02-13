const { spawn, Thread, Worker } = require("threads");
const debug = require("debug")("container-invoker");

const { ReusableInvoker } = require("./invoker");

class ContainerInvoker extends ReusableInvoker {
  constructor(task) {
    super();

    this.worker = null;
    this.task = task;
    this.coldStarts = [];
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

  async estimateNext() {
    const coldStarts = await this.worker.getColdStarts();
    debug("cold starts: ", coldStarts);
    const warmStartElapsed = this.elapsedTimeHistory.reduce((arr, elem, i) => {
      if (i === coldStarts[0]) {
        coldStarts.shift();
      } else {
        arr.push(elem);
      }
      return arr;
    }, []);

    debug("warm start elapsed: ", warmStartElapsed);

    const warmStartAvg = this.averageElapsedTime({
      customHist: warmStartElapsed,
    });

    if (this.isRunning()) {
      return warmStartAvg;
    } else {
      const coldStart = this.worker.coldStartTime();
      return warmStartAvg + coldStart;
    }
  }

  async isRunning() {
    return this.worker.isRunning();
  }
}

module.exports = { ContainerInvoker };
