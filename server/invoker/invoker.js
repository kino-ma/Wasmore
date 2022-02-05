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
  // Must return { elapsed, result }
  async _invoke(_input) {
    throw new TypeError("You must implement `async _invoke()`");
  }

  // --- Provided methods ---

  async run(input) {
    const { elapsed, result } = await this._invoke(input);
    this.elapsedTimeHistory.push(elapsed);
    return result;
  }

  get averageElapsedTime() {
    const length = this.elapsedTimeHistory.length;

    if (length <= 0) {
      return Infinity;
    }

    const sum = this.elapsedTimeHistory.reduce(
      (e, elapsedTime) => e + elapsedTime
    );

    return sum / length;
  }
}

module.exports = {
  ReusableInvoker,
};
