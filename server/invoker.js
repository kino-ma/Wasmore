const { hello, heavy_task, light_task } = require("../faas-app/pkg/faas_app");
const { callContainer, dateRunner } = require("../utils/container");

const heavy = (input) => heavy_task(input);
const light = (input) => light_task(input);
const container = (input) => {
  return callContainer(input)
    .then(([data, container]) => {
      console.log({ containerId: container.id });
      console.log({ statusCode: data.StatusCode });
      return data;
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
}

const date = (_input) => {
  console.log({ dateRunner })
  return dateRunner
    .then(([data, container]) => {
      console.log({ containerId: container.id });
      console.log({ statusCode: data.StatusCode });
      return data;
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
}

module.exports = {
  heavy,
  light,
  container,
  date,
  hello
};