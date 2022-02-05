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

    // Run both on first call
    if (!container.running) {
      container.manualStart();
      // const containerRun = this.containerInvoker._invoke(input);
      // const wasmRun = this.wasmInvoker._invoke(input);
      // return Promise.any([containerRun, wasmRun]);
    }

    console.log("wasm", { history: this.wasmInvoker.elapsedTimeHistory });
    const wasmElapsed = this.wasmInvoker.averageElapsedTime();
    console.log("container", {
      history: this.containerInvoker.elapsedTimeHistory,
    });
    const containerElapsed = this.containerInvoker.averageElapsedTime();

    console.log({ wasmElapsed, containerElapsed });

    if (wasmElapsed <= containerElapsed) {
      return await this.wasmInvoker.run(input);
    } else {
      return await this.containerInvoker.run(input);
    }
  }
}

const heavyInvoker = new SwitchingInvoker(
  {
    cachingContainer: heavyContainer,
    containerTask: "heavy",
  },
  {
    wasmFunc: heavy_task,
  }
);

const heavy = (input) => {
  return heavyInvoker.run(input);
};

const lightInvoker = new SwitchingInvoker(
  {
    cachingContainer: lightContainer,
    containerTask: "light",
  },
  {
    wasmFunc: light_task,
  }
);

const light = (input) => {
  return lightInvoker.run(input);
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

module.exports = {
  heavy,
  light,
  container,
  date,
  invokeHello,
  ReusableInvoker,
  ContainerInvoker,
  WasmInvoker,
  SwitchingInvoker,
};
