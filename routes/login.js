var express = require('express');
var router = express.Router();

const db = require ("mongoose");
const User = db.model('User');

/* GET home page. */
router.get('/', function(req, res){
  req.session.destroy(); //セッション削除
  res.render('login.ejs');
});

router.post('/', function(req, res){
  console.log(req.body);
  var id = req.body.id;
  var pwd = req.body.pwd;

  // DBからユーザ情報取得
  // if(id != 'admin'){
    User.find({userId: id},{},{},function(error, users){
      if(error)res.render('error', {message:'エラーが発生しました。'});

      if(users && users.length > 0 && users[0].pwd == pwd){
        req.session.user = id;
        req.session.userName = id;
        if(users[0].userName != ''){
          req.session.userName = users[0].userName;
        }
        res.redirect('/select');
      }else{
        res.render('login.ejs', {errorMsg:'IDかパスワードが違います。'});
      }
    });
  // }else{
  //   req.session.user = id;
  //   res.redirect('/select');
  // }
});

module.exports = router;
