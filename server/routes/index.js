var express = require("express");
var router = express.Router();

const { hello } = require("faas-app");

/* GET home page. */
router.get("/", async function (req, res, next) {
  res.send("hello, node");
});

module.exports = router;
