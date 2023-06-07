// wsサーバー
"use strict";
var http = require("http");
var WebSocketServer = require("ws").Server;
var wsServer = null;

var moment = require('moment');
var db = require ("mongoose");

// mongooseのMessageモデルを取得
var Message = db.model('Message');

var ws_arr = []; // 参加者配列
var msg_limit = 20; // ログ数の制限
var msg_length = 64; // ログの文字数制限

function start(app, port){
  var server = http.createServer(app);
  server.listen(process.env.PORT || port);
  wsServer = new WebSocketServer({server: server});
  console.log('websocket server start. port=' + port);

  wsServer.on('connection', function(ws) {
      console.log('-- websocket connected --\r\n' + ws);
      // DB初期化
      ws_arr.push(ws); // 参加者を配列に追加

      // メッセージが送信されてきた
      ws.addEventListener("message", function(e) {
        if(e.data != ""){
            var data = JSON.parse(e.data);
            console.log(data)
            okuru(data);
        }
      });

      // 切断された
      ws.on("close", function() {
          // 配列から参加者を削除
          ws_arr.forEach(function (w, i){
              if(w == ws)ws_arr.splice(i, 1);
          });
      });
  });
}

// 送信
function okuru(msg){

    // 参加者全員に送る
    ws_arr.forEach(function (w){
        console.log("gpsdata: " + msg.gpsData)
        var data = JSON.stringify({userId: msg.userId, userName: msg.userName, gpsData: msg.gpsData});
        w.send(data, function(){});
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
