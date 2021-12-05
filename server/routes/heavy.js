const express = require("express");
const router = express.Router();

const { heavy_task } = require("../../faas-app/pkg/faas_app");

/* Call heavy task. */
router.get("/", async function (req, res, next) {
  const output = heavy_task(11);
  res.send({ output });
});

module.exports = router;
