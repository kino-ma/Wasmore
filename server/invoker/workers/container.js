const { expose } = require("threads/worker");
const debug = require("debug")("container-worker");

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

    coldStarts.push(!container.running);

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
    debug({ elapsedTimes: container.elapsedTime });
    return container.elapsedTime.start === null
      ? container.elapsedTime.start
      : Infinity;
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
