const streams = require("memory-streams");
const { hello, heavy_task, light_task } = require("faas-app");
const { callContainer, dateRunner, helloContainer } = require("../utils/container");

const heavy = (input) => heavy_task(input);
const light = (input) => light_task(input);
const container = (input) => {
  return callContainer(input)
    .then(([data, container]) => {
      return data;
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
};

const date = async (_input) => {
  const container = dateRunner;
  // let before = performance.now();
  const output = await container.startAndExec();
  // let after = performance.now();
  // console.log(`startAndExec took: ${after - before} ms`);
  return output;
};

const invokeHello = async (input) => {
  const container = helloContainer;
  if (input.indexOf('\n') < 0) {
    input += "\n";
  }
  const output = await container.startAndExec(input);
  return output;
}

module.exports = {
  heavy,
  light,
  container,
  date,
  hello,
  invokeHello
};
