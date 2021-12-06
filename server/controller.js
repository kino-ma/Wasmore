const express = require('express');
const app = express();

const indexRouter = require('./routes/index');
const heavyRouter = require('./routes/heavy');
const lightRouter = require('./routes/light');

app.use('/', indexRouter);
app.use('/light-task', lightRouter);
app.use('/heavy-task', heavyRouter);

module.exports = app;