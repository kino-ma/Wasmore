const { measure } = require("../../utils/perf");

// Abstract class/interface. Subclasses must implement `constructor()` and `_invoke()`.
class ReusableInvoker {
  constructor(initOptions = {}) {
    if (this.constructor === ReusableInvoker) {
      throw new TypeError(
        "Abstract class ReusableInvoker cannot be instantiated directly"
      );
    }

    this.elapsedTimeHistory = [];
    this._initialized = false;
    this._initOptions = initOptions;
  }

  // Required method to implement this abstract class
  // returns result
  async _invoke(_input) {
    throw new TypeError("You must implement `async _invoke()`");
  }

  // optional custom method
  async _init(options = this._initOptions) {}

  // --- Provided methods ---

  async setup() {
    if (!this._initialized) {
      await this._init(this._initOptions);
      this._initialized = true;
    }
  }

  async run(input) {
    await this.setup();

    const { result, elapsed } = await measure("invoker exec", () =>
      this._invoke(input)
    );
    this.elapsedTimeHistory.push(elapsed);
    console.log({ history: this.elapsedTimeHistory });
    return { result, elapsed };
  }

  averageElapsedTime() {
    const length = this.elapsedTimeHistory.length;

    const sum = this.elapsedTimeHistory.reduce(
      (e, elapsedTime) => e + elapsedTime,
      0
    );
    console.log({ sum, length });

    const avg = sum / length;
    return !Number.isNaN(avg) ? avg : Infinity;
  }
}

module.exports = {
  ReusableInvoker,
};
