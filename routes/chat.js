var express = require('express');
var router = express.Router();
var moment = require('moment');
const webPush = require('web-push');


const vapidKeys = webPush.generateVAPIDKeys();
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

const vapidPublicKey = 'BOs2_Hb0ztqVpz5dCQp0puCXeEiTfazOeO1pZNGAMjHe0vGsY17qWQCQpsO9k6ABTGvMlPv_MnaSBByFyqa2Txc'
const vapidPrivateKey = 'cQ0zojiD3Pu0ax1hs7nVJquv8CfU28ONs6intNfhS3U'

webPush.setVapidDetails(
  'mailto:test-push@example.com',
  vapidPublicKey,
  vapidPrivateKey
);

var db = require ("mongoose");

// mongooseのMessageモデルを取得
var Message = db.model('Message');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.locals.vapidPrivateKey = vapidPublicKey
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

/**
 * Push通知の登録
 */
const inMemoryVariable = []
router.post('/api/subscribe', (req, res) => {
  const {subscription} = req.body
  console.log(req.body)
  console.log('@body')
  console.log(subscription)
  if (!inMemoryVariable.some(variable => variable.endpoint === subscription.endpoint)) {
    inMemoryVariable.push(subscription)
  }
  res.json({})
})

router.get('/api/public_key', (req, res) => {
  res.json({
    vapidPublicKey
  })
})

/**
 * 10秒後にPush通知の送信
 */
router.post('/api/notification', async (req, res) => {
  console.log("/api/notification")
  console.log(req)
    
  setTimeout(async () => {
    
    for (const subscription of inMemoryVariable) {
      try {
        await webPush.sendNotification(subscription, JSON.stringify({title: "新着メッセージです"}))
      } catch (e) {
        console.log(e)
      }
    }
  }, 2000)
  res.status(200).send({});
});

module.exports = router;
