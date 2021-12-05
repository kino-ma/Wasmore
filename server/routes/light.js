const express = require("express");
const router = express.Router();

const { light_task } = require("../../faas-app/pkg/faas_app");

/* Call light task. */
router.get("/", async function (req, res, next) {
  const output = light_task(11);
  res.send({ output });
});

module.exports = router;
