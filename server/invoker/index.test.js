const { hello } = require("faas-app");
const { VM } = require("vm2");
const { helloContainer } = require("../../utils/container");
const { date, ReusableInvoker, SwitchingInvoker } = require(".");

describe("Test Invoker", () => {
  test("Date invoker  should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
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

  test("SwitchingInvoker can reused many times", async () => {
    for (let i = 0; i < 10; i += 1) {
      const result = await invoker.run(name);
      expect(result).toEqual(expectedResult);
    }
    const avgElapsed = invoker.averageElapsedTime();
    expect(avgElapsed).toBeGreaterThan(0);
  });
});
