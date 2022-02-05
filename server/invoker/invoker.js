const { measure } = require("../../utils/perf");

// Abstract class/interface. Subclasses must implement `constructor()` and `_invoke()`.
class ReusableInvoker {
  constructor() {
    if (this.constructor === ReusableInvoker) {
      throw new TypeError(
        "Abstract class ReusableInvoker cannot be instantiated directly"
      );
    }

    this.elapsedTimeHistory = [];
  }

  // Required method to implement this abstract class
  // returns result
  async _invoke(_input) {
    throw new TypeError("You must implement `async _invoke()`");
  }

  // --- Provided methods ---

  async run(input) {
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

  setLastTime(value) {
    const len = this.elapsedTimeHistory.length;
    this.elapsedTimeHistory[len - 1] = value;
    return this.elapsedTimeHistory;
  }
}

module.exports = {
  ReusableInvoker,
};
