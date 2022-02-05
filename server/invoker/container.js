const { ReusableInvoker } = require("./invoker");

class ContainerInvoker extends ReusableInvoker {
  constructor(cachingContainer, task) {
    super();
    this.container = cachingContainer;
    this.task = task;
  }

  async _invoke(input) {
    const result = await this.container.startAndExec({
      input: parseInt(input),
      task: this.task,
    });
    const elapsed = this.container.elapsedTime.userProgram;

    return { result, elapsed };
  }
}

module.exports = { ContainerInvoker };
