const { VM } = require("vm2");
const { date, invokeWasmHello } = require("./invoker")

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
  })

  test("vm2 has correct access rights", () => {
    const sandbox = {
      hoge: "fuga"
    }
    const vm = new VM({ sandbox });

    const hoge = vm.run("hoge");
    expect(hoge).toBe(sandbox.hoge);

    expect(() => vm.run("fuga")).toThrow('fuga is not defined');
  })
});