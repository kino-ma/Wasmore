const { ContainerInvoker } = require("./container");
const { helloContainer } = require("../../utils/container");

describe("Test ContainerInvoker", () => {
  const name = "hoge";
  const expectedResult = expect.stringContaining(`hello, ${name}`);

  test("ContainerInvoker can _invoke()", async () => {
    const cachingConatiner = helloContainer;
    const invoker = new ContainerInvoker(cachingConatiner, "hello");
    await invoker.setup();
    const result = await invoker._invoke(name);

    expect(result).toEqual(expectedResult);
  });

  test("ContainerInvoker can run", async () => {
    const cachingConatiner = helloContainer;
    const invoker = new ContainerInvoker(cachingConatiner, "hello");
    invoker.setup();
    const { result, elapsed } = await invoker.run(name);

    const expectedResult = expect.stringContaining("hello");

    expect(result).toEqual(expectedResult);
    expect(elapsed).toBeGreaterThan(0);
  });
});
