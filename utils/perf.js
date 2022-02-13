const measure = async (name, fn) => {
  const before = performance.now();
  const result = await fn();
  const after = performance.now();
  const elapsed = after - before;
  console.debug(`[ELAPSED] ${name}: ${elapsed} ms`);

  return {
    result,
    before,
    after,
    elapsed,
  };
};

module.exports = { measure };
