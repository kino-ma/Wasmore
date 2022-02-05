const { measure } = require("../../utils/perf");
const { ReusableInvoker } = require("./invoker");

class ContainerInvoker extends ReusableInvoker {
  constructor(cachingContainer, task) {
    super();
    this.container = cachingContainer;
    this.task = task;
  }

  async _invoke(input) {
    return this.container.startAndExec({
      input: parseInt(input),
      task: this.task,
    });
  }
}

module.exports = { ContainerInvoker };
