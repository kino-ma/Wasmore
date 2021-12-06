const express = require('express');
const app = express();

const heavyRouter = require('./routes/heavy');
const lightRouter = require('./routes/light');

app.use('/light-task', lightRouter);
app.use('/heavy-task', heavyRouter);

module.exports = app;