const streams = require("memory-streams");
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
};

const date = (_input) => {
  console.log({ dateRunner });
  const stdout = new streams.WritableStream();
  return dateRunner
    .then((container) => {
      console.log({ container });

      container
        .attach({ stream: true, stdout: true, stderr: true })
        .then((stream) => {
          stream.pipe(stdout);
        });

      return container.start();
    })
    .then((res) => {
      console.log({ collResult: res });
      const decoded = stdout.toString();
      console.log({ decoded });

      return decoded;
    })
    .catch((err) => {
      if (err) {
        console.error(err);
      }
    });
};

module.exports = {
  heavy,
  light,
  container,
  date,
  hello,
};
