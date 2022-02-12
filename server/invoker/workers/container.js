const { expose } = require("threads/worker");

const { CachingContainer } = require("../../../utils/container");

let container = null;
const intTasks = ["light", "heavy"];

expose({
  init(cmd) {
    container = new CachingContainer(cmd);
  },

  async run(task, input) {
    const isIntTask = intTasks.includes(task);

    const res = await container.startAndExec({
      input: isIntTask ? parseInt(input) : input,
      task: task,
    });
    return res;
  },

  isRunning() {
    return container.isRunning;
  },
});
