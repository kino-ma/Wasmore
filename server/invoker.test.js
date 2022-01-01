const { date } = require("./invoker")

describe("Test Invoker", () => {
  test("It should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
  });
});