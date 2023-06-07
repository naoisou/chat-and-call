var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
  res.render('gps.ejs', {
    userId: req.session.user,
    userName: req.session.userName
  });
});

module.exports = router;
