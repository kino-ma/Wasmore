const { ContainerInvoker } = require("./container");
const { helloContainer } = require("../../utils/container");

describe("Test ContainerInvoker", () => {
  test("ContainerInvoker can _invoke()", async () => {
    const cachingConatiner = helloContainer;
    const invoker = new ContainerInvoker(cachingConatiner, "hello");
    const { result, elapsed } = await invoker._invoke();

    const expectedResult = expect.stringContaining("hello");

    expect(result).toEqual(expectedResult);
    expect(elapsed).toBeGreaterThan(0);
  });

  test("ContainerInvoker can run", async () => {
    const cachingConatiner = helloContainer;
    const invoker = new ContainerInvoker(cachingConatiner, "hello");
    const result = await invoker.run();

    const expectedResult = expect.stringContaining("hello");

    expect(result).toEqual(expectedResult);
  });
});
