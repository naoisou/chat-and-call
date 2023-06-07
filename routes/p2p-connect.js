var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('p2p-connect', { title: 'P2P通話' });
});

module.exports = router;
