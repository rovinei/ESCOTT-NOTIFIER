const line = require('@line/bot-sdk');
var https = require('https');
var querystring = require('querystring');
var exception = require('../exceptions/LineBotException');

const client = new line.Client({
    channelAccessToken: process.env.LINE_BOT_CHANNEL_TOKEN,
    channelSecret: process.env.LINE_BOT_CHANNEL_SECRET
});

function LineBot() {
	this.message = "";
	this.recipients = [];
}

LineBot.prototype.issueChannelAccessToken = function(){
	var requestOptions = {
		host: "api.line.me",
		path: "/v2/oauth/accessToken",
		port: 443,
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		}
	};

	var postData = querystring.stringify({
		"grant_type": "client_credentials",
		"client_id": process.env.LINE_BOT_CHANNEL_ID,
		"client_secret": process.env.LINE_BOT_CHANNEL_SECRET
	});

	console.log(postData);

	return new Promise(function(resolve, reject){
		var request = https.request(requestOptions, function(response){
			var result = "";
			console.log(`STATUS: ${response.statusCode}`);
		  	console.log(`HEADERS: ${JSON.stringify(response.headers)}`);
		  	response.setEncoding('utf8');
		  	response.on('data', (chunk) => {
		    	console.log(`BODY: ${chunk}`);
		    	result = result + chunk;
		  	});
		  	response.on('end', () => {
		    	console.log('No more data in response.');
		    	resolve(result);
		  	});
		});

		request.on('error', (e) => {
		 	console.error(`problem with request: ${e.message}`);
		 	reject(e.message);
		});

		request.write(postData);
		request.end();
	});
}

LineBot.prototype.prepareMessage = function(message=null, recipients=null) {
    if (message != null && message != ""){
    	this.message = message;
    } else {
    	throw new exception.ArgumentTypeError("Message cannot be empty string or null.");
    }

    if (recipients != null && typeof recipients == "string") {
        this.recipients = [recipients];
    } else if (recipients != null && Array.isArray(recipients)) {
        this.recipients = recipients;
    } else {
        throw new exception.ArgumentTypeError("Recipients user argument must be type of String or Array and cannot be null.");
    }

}

LineBot.prototype.sendMessage = function(message=null, recipients=null) {
	if (this.message == "" && message == null) {
		throw new exception.SendMessageException("Cannot send empty string or null message.");
	} else if (message != null && message != "") {
		this.message = message;
	}

	if (this.recipients.length == 0 && recipients == null){
		throw new exception.SendMessageException("Cannot send message to None user.");
	} else if (this.recipients.length == 0 && typeof recipients == "string" && recipients != "") {
		this.recipients = [recipients];
	} else if (this.recipients.length == 0 && Array.isArray(recipients) && recipients.length != 0) {
		this.recipients = recipients
	} else {
		throw new exception.SendMessageException("Recipients user argument must be type of String or Array and cannot be null.");
	}

	var messageToSend = {
	    type: 'text',
	    text: this.message
	};

	// UserID : U4de560df34566f359ed942d92b11d936
	for(var userIndex = 0; userIndex < this.recipients.length; userIndex++){
		var user = this.recipients[userIndex];
		client.pushMessage(user, messageToSend)
	    .then(() => {
	        console.log("successfully send message to " + user);
	    })
	    .catch(() => {
	    	console.log("Failed to send message to " + user);
	    });
	}
	
}


module.exports = LineBot;