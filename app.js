const express = require('express')
const app = express()
const port = 3000;
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const db = require('./mongo');

//app.listen(port, () => console.log('Example app listening on port 3000!'))

// View EngineにEJSを指定。
app.set('view engine', 'ejs');

// 静的コンテンツ用
app.use(express.static(path.join(__dirname,'public/')));

// 提供javascriptモジュール
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

// レイアウト機能
//const expressLayouts = require('express-ejs-layouts');
//app.use(expressLayouts);

// ログインセッション設定
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000
  }
}));

app.use(express.json());
app.use(express.urlencoded());

//wsサーバ
var server = require("./routes/ws-server");
//var server = require("./routes/ws-gps");

server.start(app, port);

// ルーティング設定
app.use('/login', require('./routes/login'));
app.use('/*', require('./routes/common'));
app.use('/userRegist', require('./routes/userRegist'));
app.use('/logout', require('./routes/logout'));
app.use('/select', require('./routes/select'));
app.use('/p2p-connect', require('./routes/p2p-connect'));
app.use('/chat', require('./routes/chat'));
//app.use('/gps', require('./routes/gps'));

