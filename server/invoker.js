const streams = require("memory-streams");
const { VM } = require("vm2");

const { hello, heavy_task, light_task } = require("faas-app");
const {
  callContainer,
  dateRunner,
  helloContainer,
  lightContainer,
  heavyContainer,
} = require("../utils/container");

// Abstract class/interface. Subclasses must implement `constructor()` and `_invoke()`.
class ReusableInvoker {
  constructor() {
    if (this.constructor === ReusableInvoker) {
      throw new TypeError(
        "Abstract class ReusableInvoker cannot be instantiated directly"
      );
    }

    this.elapsedTimeHistory = [];
  }

  // Required method to implement this abstract class
  // Must return { elapsed, result }
  async _invoke(_input) {
    throw new TypeError("You must implement `async _invoke()`");
  }

  // --- Provided methods ---

  async run(input) {
    const { elapsed, result } = await this._invoke(input);
    this.elapsedTimeHistory.push(elapsed);
    return result;
  }

  get averageElapsedTime() {
    const sum = this.elapsedTimeHistory.reduce(
      ({ c, s, u }, { create, start, userProgram }) => ({
        create: create + c,
        start: start + s,
        userProgram: userProgram + u,
      })
    );

    return sum / this.elapsedTime.execs.length;
  }
}

class ContainerInvoker extends ReusableInvoker {
  constructor(cachingContainer, task) {
    super();
    this.container = cachingContainer;
    this.task = task;
  }

  async invoke(input) {
    return container.startAndExec({ input: parseInt(input), task: this.task });
  }
}

const callVirtualized = (func, arg) => {
  const globalObject = {
    func,
    arg,
  };

  const vm = new VM({
    sandbox: globalObject,
  });

  return vm.run("func(arg)");
};

const heavy = (input) => {
  const container = heavyContainer;
  if (!container.running) {
    container.manualStart();
    return callVirtualized(heavy_task, input);
  } else {
    return container.startAndExec({ input: parseInt(input), task: "heavy" });
  }
};

const light = (input) => {
  const container = lightContainer;
  if (!container.running) {
    container.manualStart();
    return callVirtualized(light_task, input);
  } else {
    return container.startAndExec({ input: parseInt(input), task: "light" });
  }
};

const container = async (input) => {
  try {
    const [data, container] = await callContainer(input);
    return data;
  } catch (err) {
    if (err) {
      console.error(err);
    }
  }
};

const date = async (_input) => {
  const container = dateRunner;
  // let before = performance.now();
  const output = await container.startAndExec();
  // let after = performance.now();
  // console.log(`startAndExec took: ${after - before} ms`);
  return output;
};

const invokeHello = async (input) => {
  const container = helloContainer;
  return container.startAndExec({ input, task: "hello" });
};

const invokeWasmHello = async (name) => {
  return callVirtualized(hello, name);
};

module.exports = {
  heavy,
  light,
  container,
  date,
  invokeWasmHello,
  invokeHello,
};
