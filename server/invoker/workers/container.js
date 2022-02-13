const { expose } = require("threads/worker");

const { CachingContainer } = require("../../../utils/container");

let container = null;
const coldStarts = [];
const intTasks = ["light", "heavy"];

expose({
  init(cmd) {
    container = new CachingContainer(cmd);
  },

  async run(task, input) {
    const isIntTask = intTasks.includes(task);

    coldStarts.push(!container.isRunning);

    const res = await container.startAndExec({
      input: isIntTask ? parseInt(input) : input,
      task: task,
    });
    return res;
  },

  isRunning() {
    return container.isRunning;
  },

  coldStartTime() {
    return container.elapsedTime.start ?? Infinity;
  },

  getColdStarts() {
    return coldStarts.reduce((arr, elem, i) => {
      if (elem) {
        arr.push(i);
      }
      return arr;
    }, []);
  },
});
