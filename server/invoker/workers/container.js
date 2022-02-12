const { expose } = require("threads/worker");

const { CachingContainer } = require("../../../utils/container");

let container = null;
const intTasks = ["light", "heavy"];

expose({
  init(cmd) {
    container = new CachingContainer(cmd);
  },

  run(task, input) {
    const isIntTask = intTasks.includes(task);

    return container.startAndExec({
      input: isIntTask ? parseInt(input) : input,
      task: task,
    });
  },

  isRunning() {
    return container.isRunning;
  },
});
