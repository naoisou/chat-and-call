var express = require('express');
var router = express.Router();

const db = require ("mongoose");
const User = db.model('User');

router.get('/', function(req, res){
  res.render('userRegist');
});


router.post('/', function(req, res){
  var user = new User();
  user.userId = req.body.id;
  user.pwd = req.body.pwd;
  user.userName = req.body.userName;

  User.find({userId: user.userId},{},{},function(error, users){
    if(users != null && users.length > 0){
      res.render('userRegist', {errorMsg:'登録済みのユーザIDです'});
    }else{
      user.save(function(err) {
        if (err) { res.render('error', {message:'エラーが発生しました。'}); }
        res.render('userRegist', {errorMsg: '登録が完了しました'});
      });
    }
  });

});

router.post('/delete', function(req, res){
  console.log("remove user: " + req.body.userId);
  User.remove({ userId: req.body.userId}, function(err) {
    res.render('userRegist', {errorMsg: '削除しました。'});
  });
});

module.exports = router;
