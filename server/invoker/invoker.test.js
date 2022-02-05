const { ReusableInvoker } = require("./invoker");

describe("Test ReusableInvoker class", () => {
  class SampleInvoker extends ReusableInvoker {
    constructor() {
      super();
    }

    async _invoke() {
      return "hello";
    }
  }

  const expectedResult = expect.stringContaining("hello");

  test("Invoker can invoke task", async () => {
    const invoker = new SampleInvoker();
    const result = await invoker._invoke();
    expect(result).toEqual(expectedResult);
  });

  test("Invoker can run", async () => {
    const invoker = new SampleInvoker();
    const { result, elapsed } = await invoker.run();
    expect(result).toEqual(expectedResult);
    expect(elapsed).toBeGreaterThan(0);
  });

  test("Invoker can be reused and get average elapsed time", async () => {
    const invoker = new SampleInvoker();
    for (let i = 0; i < 10; i += 1) {
      const { result } = await invoker.run();
      expect(result).toEqual(expectedResult);
    }
    const avgElapsed = invoker.averageElapsedTime();
    // approximately equals to 16 with 2 significant figures
    expect(avgElapsed).toBeGreaterThan(0);
  });
});
