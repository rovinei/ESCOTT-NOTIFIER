var dotenv = require('dotenv').config();
const LineBot = require('./scripts/linebot');

var bot = new LineBot();
var getToken = bot.issueChannelAccessToken();
getToken.then(function(res){
	console.log(res);
}).catch(function(err){
	console.log(err);
})
// bot.sendMessage("Clone project from github.com and follow README.md for instruction : https://github.com/rovinei/ESCOTT-NOTIFIER.git", ['U4de560df34566f359ed942d92b11d936']);