const wasm = require("faas-app");

const funcName = "hello";

describe("Test WebASsembly itself", () => {
  test("wasm hello returns correct value", async () => {
    const hello = wasm[funcName];

    const name = "kino-ma";
    const output = hello(name);
    expect(output).toBe(`hello, ${name}`);

    const name2 = "makino";
    const output2 = await hello(name2 + "dayo");
    expect(output2).not.toBe(`hello, ${name2}`);
  });
});
