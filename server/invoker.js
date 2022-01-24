const streams = require("memory-streams");
const { VM } = require("vm2");

const { hello, heavy_task, light_task } = require("faas-app");
const { callContainer, dateRunner, helloContainer, lightContainer, heavyContainer } = require("../utils/container");

const callVirtualized = (func, arg) => {
  const globalObject = {
    func,
    arg
  };

  const vm = new VM({
    sandbox: globalObject
  });

  return vm.run("func(arg)");
}

const heavy = (input) => {
  const container = heavyContainer
  if (!container.running) {
    container.manualStart();
    return callVirtualized(heavy_task, input);
  } else {
    return container.startAndExec({ input: parseInt(input), task: "heavy" })
  }
};

const light = (input) => {
  const container = lightContainer
  if (!container.running) {
    container.manualStart();
    return callVirtualized(light_task, input);
  } else {
    return container.startAndExec({ input: parseInt(input), task: "light" })
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
}

const invokeWasmHello = async (name) => {
  return callVirtualized(hello, name);
}

module.exports = {
  heavy,
  light,
  container,
  date,
  invokeWasmHello,
  invokeHello
};
