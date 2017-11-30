var dotenv = require('dotenv').config();
const LineBot = require('./scripts/linebot');
const MySQL = require('./scripts/mysqlconnection');
var Mail = require('./scripts/sendmail').Mail;
var htmlMailTemplate = require('./scripts/sendmail').htmlMailTemplate;

// var bot = new LineBot();
// bot.sendMessage("Power usage over 2100 kwh", ['U4de560df34566f359ed942d92b11d936']);
var mysqlClient = new MySQL();
var response = mysqlClient.getRoomUsageData();
response.then(function(results, fields){
	mysqlClient.closePoolConnection().then(function(status){
		console.log("All pool connections closed.");
	}).catch(function(err){
		console.log("Failed to close pool connections.")
	});
	checkRoomConsumption(results, 0);

}).catch(function(error){
	mysqlClient.closePoolConnection().then(function(status){
		console.log("All pool connections closed.");
	}).catch(function(err){
		console.log("Failed to close pool connections.")
	});
	console.log(error);
});

function checkRoomConsumption(data, retried){
	var mail = new Mail();
	var dataLength = data.length;
	var rooms = data;
	var roomIndex = 0; 
	var failed = [];
	var retried = retried;
	// Starting doing stuff and things with data
	function process(){
		if(roomIndex < dataLength){
			if ( (rooms[roomIndex].over_usage_power != null && rooms[roomIndex].over_usage_power > rooms[roomIndex].power)
				|| (rooms[roomIndex].over_usage_water != null && rooms[roomIndex].over_usage_water > rooms[roomIndex].water) ) {
				console.log("FOUND OVER USAGE : " + rooms[roomIndex].name);
				var htmlText = mail.formatHTML(htmlMailTemplate, [
						rooms[roomIndex].power + "kwh",
						rooms[roomIndex].over_usage_power + "kwh",
						(rooms[roomIndex].over_usage_power - rooms[roomIndex].power) + "kwh",
						rooms[roomIndex].water + "m<sup>3</sup>",
						rooms[roomIndex].over_usage_water + "m<sup>3</sup>",
						(rooms[roomIndex].over_usage_water - rooms[roomIndex].water) + "m<sup>3</sup>",
					]);
				var mailOptions = {
					sender: "ESCOTT TEAM <noreply@property.vkirirom.com>",
			        from: "noreply@property.vkirirom.com",
			        replyTo: "noreply@property.vkirirom.com",
			        to: rooms[roomIndex].email, //rooms[roomIndex].email,
			        subject: "Power and water over usage alert",
			        text: "Your room name [" +  rooms[roomIndex].name + "] has reached over the limited usage consumption you had set.",
			        html: htmlText
			    };
			    // send next message from the pending queue
			    mail.sendMail(mailOptions).then(function(status){
			    	if (status == 200) {
			    		console.log("Successfully send mail.");
			    	} else if (status == 201) {
			    		failed.push(rooms[roomIndex]);
			    		console.log("mail pool connections not available, backup plan triggered.");
			    	}
			    	roomIndex++;
					process();
			    }).catch(function(err){
			    	failed.push(rooms[roomIndex]);
			    	console.log(err);
			    	console.log("Failed to send mail, backup plan triggered.");
			    	roomIndex++;
					process();
			    });

			} else {
				console.log("NO OVER USAGE");
				roomIndex++;
				process();
			}
		}else{
			console.log("FAILED COUNT " + failed.length);
			if (failed.length > 0) {
				++retried;
				checkRoomConsumption(failed, retried);
			}else {
				mail.closeMailPoolConnection();
			}
		}
	}

	process();

}

// var bot = new LineBot();
// bot.sendMessage("Power usage over 2100 kwh", ['U4de560df34566f359ed942d92b11d936']);