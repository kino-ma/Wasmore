const { spawn, Thread, Worker } = "threads";

const { hello, heavy_task, light_task } = require("faas-app");
// TODO?: now invoker returns Object, and tests will fail
const {
  callContainer,
  dateRunner,
  helloContainer,
} = require("../../utils/container");
const { ReusableInvoker } = require("./invoker");
const { ContainerInvoker } = require("./container");
const { WasmInvoker } = require("./wasm");

class SwitchingInvoker extends ReusableInvoker {
  constructor({ containerTask }, { wasmFuncName }) {
    super();

    this.containerInvoker = new ContainerInvoker(containerTask);
    this.wasmInvoker = new WasmInvoker(wasmFuncName);
  }

  async _init() {
    await Promise.all([
      this.containerInvoker.setup(),
      this.wasmInvoker.setup(),
    ]);
  }

  async _fin() {
    await this.containerInvoker._fin();
    await this.wasmInvoker._fin();
  }

  async _invoke(input) {
    // Run both on the first 3 calls
    // if (this.elapsedTimeHistory.length < 3) {
    //   const wasmRun = this.wasmInvoker.run(input);
    //   const containerRun = this.containerInvoker.run(input);

    //   const { result } = await Promise.any([wasmRun, containerRun]);
    //   return result;
    // }

    // console.log("wasm history", this.wasmInvoker.elapsedTimeHistory);
    // const wasmEstimated = await this.wasmInvoker.estimateNext();
    // console.log("container hisotry", this.containerInvoker.elapsedTimeHistory);
    // const containerEstimated = await this.containerInvoker.estimateNext();

    // console.log({ wasmEstimated, containerEstimated });

    // if (wasmEstimated <= containerEstimated) {
    // let { result } = await this.wasmInvoker.run(input);
    // return result;
    // } else {
    let { result } = await this.containerInvoker.run(input);
    return result;
    // }
  }
}

const heavyInvoker = new SwitchingInvoker(
  {
    containerTask: "heavy",
  },
  {
    wasmFuncName: "heavy_task",
  }
);

const heavy = (input) => {
  return heavyInvoker.run(input);
};

const lightInvoker = new SwitchingInvoker(
  {
    containerTask: "light",
  },
  {
    wasmFuncName: "light_task",
  }
);

const light = (input) => {
  return lightInvoker.run(input);
};

const lightInvokerMany = [...Array(50).keys()].map(
  (_) =>
    new SwitchingInvoker(
      {
        containerTask: "light",
      },
      {
        wasmFuncName: "light_task",
      }
    )
);

const heavyInvokerMany = [...Array(50).keys()].map(
  (_) =>
    new SwitchingInvoker(
      {
        containerTask: "heavy",
      },
      {
        wasmFuncName: "heavy_task",
      }
    )
);

const lightMany = lightInvokerMany.map((invoker) => () => invoker.run);
const heavyMany = heavyInvokerMany.map((invoker) => () => invoker.run);

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
  const output = await container.startAndExec();
  return output;
};

const invokeHello = async (input) => {
  const container = helloContainer;
  return container.startAndExec({ input, task: "hello" });
};

module.exports = {
  heavy,
  light,
  heavyMany,
  lightMany,
  container,
  date,
  invokeHello,
  ReusableInvoker,
  ContainerInvoker,
  WasmInvoker,
  SwitchingInvoker,
};
