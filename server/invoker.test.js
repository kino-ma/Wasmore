const { date } = require("./invoker")

describe("Test Invoker", () => {
  test("It should return date", async () => {
    const output = await date();
    const { stdout, callResult } = output;
    console.debug({ output })
    expect(callResult).not.toBeFalsy();
    expect(stdout).not.toBe(undefined);
  });
});