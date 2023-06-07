var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Message = new mongoose.Schema({
    roomId: String,
    userId: String,
    userName: String,
    message: String,
    date: Date
});

var User = new mongoose.Schema({
    userId: String,
    pwd: String,
    userName: String
});

mongoose.set('debug', true);
mongoose.model('User', User);
mongoose.model('Message', Message);
mongoose.connect('mongodb+srv://sou:.science99@cluster0.tsxou.mongodb.net/test');

