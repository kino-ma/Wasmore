const measure = async (name, fn) => {
  const before = performance.now();
  const result = await fn();
  const after = performance.now();
  const elapsed = after - before;
  console.log(`[ELAPSED] ${name}: ${elapsed} ms`);

  return {
    result,
    before,
    after,
    elapsed,
  };
};
