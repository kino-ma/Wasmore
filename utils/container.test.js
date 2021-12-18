const { callContainer } = require("./container");

describe("Test the container utility", () => {
  test("Run `date` on ubuntu", async () => {
    const [output, _container] = await callContainer();
    expect(output.StatusCode).toBe(0);
  });
});
