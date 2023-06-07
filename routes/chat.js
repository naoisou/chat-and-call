var express = require('express');
var router = express.Router();
var moment = require('moment');

var db = require ("mongoose");

// mongooseのMessageモデルを取得
var Message = db.model('Message');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('chat',{
        moment: moment,
        roomId: req.query.roomId,
        userId: req.session.user,
        userName: req.session.userName
    });
});
router.post('/delete', function(req, res){
  console.log(req.body);
  //DBのデータを削除
  Message.remove({roomId: { $eq: req.param("roomId") } }, function(){});
  //Message.remove( { roomId: { $eq: req.query.roomId } } )


  res.redirect('/chat?roomId=' + req.param("roomId"));
});

router.get('/init', function(req, res){
  res.header('Content-Type', 'application/json; charset=utf-8')
  
  Message.aggregate([
                      { $match: { roomId: req.query.roomId } },
                      { $project:{
                        message: 1,
                        userName: 1,
                        userId: 1,
                        date: {$dateToString: {format: "%m/%d %H:%M:%S",date: "$date"}}
                       }
                      },
                      { $sort: { date: 1 } }
                    ],
                        function (error, messages) {
                            if(error)return console.error(error);
                            res.send(JSON.stringify(messages));
                      });



  /*
  Message.find({roomId: req.query.roomId}, {sort: {date: -1}}, function (error, messages) {
      if(error)return console.error(error);
      res.send(JSON.stringify(messages));
  });
  */
});
module.exports = router;
