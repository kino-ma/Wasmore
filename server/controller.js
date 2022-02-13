const express = require("express");
const app = express();

const {
  heavy,
  light,
  container,
  date,
  invokeHello,
  lightMany,
} = require("./invoker");

const indexRouter = require("./routes/index");

const invokeTask = (task) => {
  return async (req, res, _next) => {
    console.log(req.body);
    const output = await task(req.body.input);
    res.json({
      output: output.stdout ?? output.result ?? output,
      elapsed: output.elapsed ?? undefined,
    });
    return output;
  };
};

const invokeManyTask = (manyInvokers) => {
  return async (req, res, _next) => {
    console.log(req.body);
    const { invokerId } = req.params;
    const task = manyInvokers[invokerId];
    const output = await task(req.body.input);
    res.json({
      output: output.stdout ?? output.result ?? output,
      elapsed: output.elapsed ?? undefined,
    });
    return output;
  };
};

app.use("/", indexRouter);
app.use("/light-task", invokeTask(light));
app.use("/heavy-task", invokeTask(heavy));
app.use("/light-tasks/:invokerId", invokeManyTask(lightMany));
app.use("/heavy-tasks/:invokerId", invokeManyTask(heavyMany));
app.use("/container", invokeTask(container));
app.use("/date", invokeTask(date));
app.use("/hello", invokeTask(invokeHello));

module.exports = app;
