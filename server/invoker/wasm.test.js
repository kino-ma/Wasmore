const { hello } = require("faas-app");

const { WasmInvoker } = require("./wasm");

describe("Test WebASsembly itself", () => {
  test("wasm hello returns correct value", async () => {
    const name = "kino-ma";
    const output = hello(name);
    expect(output).toBe(`hello, ${name}`);

    const name2 = "makino";
    const output2 = await hello(name2 + "dayo");
    expect(output2).not.toBe(`hello, ${name2}`);
  });
});

describe("Test WasmInvoker", () => {
  const name = "hoge";
  const expectedResult = `hello, ${name}`;

  test("WasmInvoker can _invoke()", async () => {
    const func = hello;
    const invoker = new WasmInvoker(func);

    const { result, elapsed } = await invoker._invoke(name);

    expect(result).toEqual(expectedResult);
    expect(elapsed).toBeGreaterThan(0);
  });

  test("WasmInvoker can run", async () => {
    const func = hello;
    const invoker = new WasmInvoker(func);

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
    // approximately equals to 16 with 2 significant figures
    expect(avgElapsed).toBeGreaterThan(0);
  });
});
