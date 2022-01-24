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
});