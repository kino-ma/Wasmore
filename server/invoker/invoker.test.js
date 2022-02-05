const { ReusableInvoker } = require("./invoker");

describe("Test ReusableInvoker class", () => {
  class SampleInvoker extends ReusableInvoker {
    constructor() {
      super();
    }

    async _invoke() {
      return { result: "hello", elapsed: 16 };
    }
  }

  test("Invoker can invoke task", async () => {
    const invoker = new SampleInvoker();
    const { result, elapsed } = await invoker._invoke();
    expect(result).toBe("hello");
    expect(elapsed).toBe(16);
  });

  test("Invoker can run", async () => {
    const invoker = new SampleInvoker();
    const result = await invoker.run();
    expect(result).toBe("hello");
  });

  test("Invoker can be reused and get average elapsed time", async () => {
    const invoker = new SampleInvoker();
    for (let i = 0; i < 10; i += 1) {
      const result = await invoker.run();
      expect(result).toBe("hello");
    }
    const avgElapsed = invoker.averageElapsedTime();
    // approximately equals to 16 with 2 significant figures
    expect(avgElapsed).toBeCloseTo(16);
    console.info({ avgElapsed });
  });
});
