var express = require('express');
var router = express.Router();

router.all('/*', function(req, res, next) {
    console.log("loginCheck: " + req.session.user);
    if(req.session.user){
      next();
    }else{
      res.render('login.ejs');
    }
  }
);

module.exports = router;
