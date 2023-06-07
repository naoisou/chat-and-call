var http = require('https'),
    io = require('socket.io');

server = http.createServer(function(req, res){
    // サーバの設定
    res.writeHeader(200, {'Content-Type': 'text/html'});
    res.end('<h1>Hello world</h1>');
});

server.listen(3000); //Listen Port

var io = io.listen(server); //socketの取得

// user接続に対するハンドラ
io.on('connection', function(client){

        // Message受信時のハンドラ
        client.on('message',function(message){
                client.send(message); //エコーバック
                client.broadcast(message); //他の接続ユーザーへ送信
        });

        // クライアント切断時のハンドラ
        client.on('disconnect', function(){
                // クライアントがleaveしたことを接続ユーザーへ送信
                client.broadcast(client.sessionId + ' disconnected' );
        });
});
