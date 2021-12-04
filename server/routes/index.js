var express = require('express');
var router = express.Router();

const init = require("../../faas-app/pkg/faas_app");

/* GET home page. */
router.get('/', async function (req, res, next) {
  const { hello } = await init();
  res.send(hello());
});

module.exports = router;
