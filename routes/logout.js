var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res){
  req.session.destroy(); //セッション削除
  res.render('login.ejs', {errorMsg:'ログアウトしました。'});
});

module.exports = router;
