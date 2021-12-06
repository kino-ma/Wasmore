const { hello, heavy_task, light_task } = require("../faas-app/pkg/faas_app");

const heavy = (input) => heavy_task(input);
const light = (input) => light_task(input);

module.exports = {
  heavy,
  light,
  hello
};