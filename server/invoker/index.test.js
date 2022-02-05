const { hello } = require("faas-app");
const { VM } = require("vm2");
const { helloContainer } = require("../../utils/container");
const {
  date,
  invokeWasmHello,
  ReusableInvoker,
  ContainerInvoker,
  WasmInvoker,
  SwitchingInvoker,
} = require(".");

describe("Test Invoker", () => {
  test("Date invoker  should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
  });

  test("wasm invoker return correct value", async () => {
    const name = "kino-ma";
    const output = await invokeWasmHello(name);
    expect(output).toBe(`hello, ${name}`);

    const name2 = "makino";
    const output2 = await invokeWasmHello(name2 + "dayo");
    expect(output2).not.toBe(`hello, ${name2}`);
  });

  test("vm2 has correct access rights", () => {
    const sandbox = {
      hoge: "fuga",
    };
    const vm = new VM({ sandbox });

    const hoge = vm.run("hoge");
    expect(hoge).toBe(sandbox.hoge);

    expect(() => vm.run("fuga")).toThrow("fuga is not defined");
  });
});

describe("Test ReusableInvoker class", () => {
  class SampleInvoker extends ReusableInvoker {
    constructor() {
      super();
    }

    async _invoke() {
      return { result: "hello", elapsed: 16 };
    }
  }

  test("Invoker can invoke task", async () => {
    const invoker = new SampleInvoker();
    const { result, elapsed } = await invoker._invoke();
    expect(result).toBe("hello");
    expect(elapsed).toBe(16);
  });

  test("Invoker can run", async () => {
    const invoker = new SampleInvoker();
    const result = await invoker.run();
    expect(result).toBe("hello");
  });

  test("Invoker can be reused and get average elapsed time", async () => {
    const invoker = new SampleInvoker();
    for (let i = 0; i < 10; i += 1) {
      const result = await invoker.run();
      expect(result).toBe("hello");
    }
    const avgElapsed = invoker.averageElapsedTime;
    // approximately equals to 16 with 2 significant figures
    expect(avgElapsed).toBeCloseTo(16);
  });
});

describe("Test SwitchingInvoker", () => {
  const name = "hoge";
  const expectedResult = expect.stringContaining(`hello, ${name}`);
  const cachingContainer = helloContainer;
  const invoker = new SwitchingInvoker(
    { cachingContainer, containerTask: "hello" },
    { wasmFunc: hello }
  );

  test("SwitchingInvoker can _invoke()", async () => {
    const { result, elapsed } = await invoker._invoke(name);

    expect(result).toEqual(expectedResult);
    expect(elapsed).toBeGreaterThan(0);
  });

  test("SwitchingInvoker can run", async () => {
    const result = await invoker.run(name);

    expect(result).toEqual(expectedResult);
  });

  test("WasmInvoker can reused many times", async () => {
    const func = hello;
    const invoker = new WasmInvoker(func);

    for (let i = 0; i < 10; i += 1) {
      const result = await invoker.run(name);
      expect(result).toEqual(expectedResult);
    }
    const avgElapsed = invoker.averageElapsedTime;
    expect(avgElapsed).toBeGreaterThan(0);
  });
});
