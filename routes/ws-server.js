// wsサーバー
"use strict";
var http = require("http");
var WebSocketServer = require("ws").Server;
var url = require('url');
var moment = require('moment');
var db = require ("mongoose");



// mongooseのMessageモデルを取得
var Message = db.model('Message');

var msg_limit = 20; // ログ数の制限
var msg_length = 64; // ログの文字数制限

var ws_arr = [[],[]];

function start(app, port){
  var server = http.createServer(app);
  server.listen(process.env.PORT || port);

  const wss1 = new WebSocketServer({ noServer: true });
  const wss2 = new WebSocketServer({ noServer: true });
  
  wss1.on('connection', function connection(ws) {
    console.log('-- wss1 connected --\r\n');
    wsServerCore(ws, 1);

  });
  
  wss2.on('connection', function connection(ws) {
    console.log('-- wss2 connected --\r\n');
    wsServerCore(ws, 2);

  });

  server.on('upgrade', function upgrade(request, socket, head) {
    const parthUrl = url.parse(request.url, true);
    console.log("upgrade: " + parthUrl.query.roomId);
    const pathname = parthUrl.query.roomId;
    if (pathname == '1') {
      wss1.handleUpgrade(request, socket, head, function done(ws) {
        wss1.emit('connection', ws, request);
      });
    } else if (pathname == '2') {
      wss2.handleUpgrade(request, socket, head, function done(ws) {
        wss2.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }

  });
}


function wsServerCore(ws, roomId){
    const target = roomId - 1;
    if(ws_arr[target]){
      // DB初期化
      ws_arr[target].push(ws); // 参加者を配列に追加

      // メッセージが送信されてきた
      ws.addEventListener("message", function(e) {
        if(e.data != ""){
          const jsonObj = JSON.parse(e.data);
          console.log(jsonObj.message);
          if(jsonObj.message != ""){
            okuru(jsonObj, ws_arr[target]);
          }
        }
      });

      // 切断された
      ws.on("close", function() {
          // 配列から参加者を削除
          ws_arr[target].forEach(function (w, i){
              if(w == ws)ws_arr[target].splice(i, 1);
          });
      });

    }
}

// DBに登録して参加者全員に受信させる関数
function okuru(data, ws_arr){
  
  // メッセージ長を制限
  if(data.message.length > msg_length){
    data.message = "※メッセージが長すぎです";
  }else{
    // サニタイズ
    data.message = sanitize_string(data.message);
  }

  // メッセージドキュメント作成
  var mes = new Message({
      roomId: data.roomId,
      userId: data.userId,
      message: data.message,
      userName: data.userName,
      date: new Date()
  });

  // ログ追加
  mes.save(function(error){
      if(error)return console.error(error);

      // 最大件数以上増えたら古い物を消す処理（ここ複雑になってしまいました）
      Message.count({roomid: data.roomId}, function(error, count){
          if(count > msg_limit){
            Message.find({roomId: data.roomId}).sort({date: -1}).limit(1).exec(function (err,res){ // 実行、ドキュメントの配列が取得できる
                          res.forEach(function (d){ // ドキュメントそれぞれの
                              Message.remove({_id: d._id}, function(){}); // ＩＤが一致する物を削除
                          });
                      });

          }
      });
  });   

  // 参加者全員に送る
  ws_arr.forEach(function (w){
      data.date = moment(mes.date).format('M/D HH:mm:ss');
      var sendData = JSON.stringify(data);
      console.log("send : " + sendData);
      w.send(sendData, function(){});
  });
}


// サニタイズ（タグ等が送信された時に無効にする）関数
function sanitize_string(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}


exports.start = start;
