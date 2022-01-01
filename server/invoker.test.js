const { date } = require("./invoker")

describe("Test Invoker", () => {
  test("Date invoker  should return date", async () => {
    const output = await date();
    expect(output).not.toBeFalsy();
  });
});