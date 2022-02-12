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

expose({
  invokers: {},

  addContainer(name, cachingContainer, task) {
    const invoker = new ContainerInvoker(cachingContainer, task);
    this.invokers[name] = invoker;
  },

  runContainer(name, input) {
    if (!name in this.invokers) {
      throw new Error(`no such ContainerInvoker: ${name}`);
    }

    const invoker = this.invokers[name];
    return invoker.run(input);
  },
});

module.exports = { ContainerInvoker };
