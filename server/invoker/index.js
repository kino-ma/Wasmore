const { hello, heavy_task, light_task } = require("faas-app");

const {
  callContainer,
  dateRunner,
  helloContainer,
  lightContainer,
  heavyContainer,
} = require("../../utils/container");
const { ReusableInvoker } = require("./invoker");
const { ContainerInvoker } = require("./container");
const { WasmInvoker } = require("./wasm");

class SwitchingInvoker extends ReusableInvoker {
  constructor({ cachingContainer, containerTask }, { wasmFunc }) {
    super();

    this.containerInvoker = new ContainerInvoker(
      cachingContainer,
      containerTask
    );
    this.wasmInvoker = new WasmInvoker(wasmFunc);
  }

  async _invoke(input) {
    const container = this.containerInvoker.container;
    if (!container.running) {
      container.manualStart();
      return this.wasmInvoker._invoke(input);
    } else {
      return this.containerInvoker._invoke(input);
    }
  }
}

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
  ReusableInvoker,
  ContainerInvoker,
  WasmInvoker,
  SwitchingInvoker,
};