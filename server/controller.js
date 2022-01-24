const express = require('express');
const app = express();

const { heavy, light, container, date, invokeHello } = require('./invoker');

const indexRouter = require('./routes/index');

const invokeTask = (task) => {
  return async (req, res, _next) => {
    console.log(req.body);
    const output = await task(req.body.input);
    res.json({
      output: output.stdout ?? output
    });
    return output;
  }
}

app.use('/', indexRouter);
app.use('/light-task', invokeTask(light));
app.use('/heavy-task', invokeTask(heavy));
app.use('/container', invokeTask(container));
app.use('/date', invokeTask(date));
app.use('/hello', invokeTask(invokeHello));

module.exports = app;