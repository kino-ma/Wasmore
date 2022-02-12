const { expose } = "threads/worker";

const { measure } = require("../../utils/perf");
const { ReusableInvoker } = require("./invoker");

const intTasks = ["light", "heavy"];

class ContainerInvoker extends ReusableInvoker {
  constructor(cachingContainer, task) {
    super();
    this.container = cachingContainer;
    this.task = task;
    this.isIntTask = intTasks.includes(task);
  }

  async _invoke(input) {
    return this.container.startAndExec({
      input: this.isIntTask ? parseInt(input) : input,
      task: this.task,
    });
  }
}

module.exports = { ContainerInvoker };
