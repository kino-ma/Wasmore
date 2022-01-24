const { date, hello } = require("./invoker")

describe("Test Invoker", () => {
  test("Date invoker  should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
  });

  test("wasm invoker", async () => {
    const name = "kino-ma";
    const output = hello(name);
    expect(output).toBe(`hello, ${name}`);
  })
});