const { date, invokeWasmHello } = require("./invoker")

describe("Test Invoker", () => {
  test("Date invoker  should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
  });

  test("wasm invoker", async () => {
    const name = "kino-ma";
    const output = await invokeWasmHello(name);
    expect(output).toBe(`hello, ${name}`);
  })
});