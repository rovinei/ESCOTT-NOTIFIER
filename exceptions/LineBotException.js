
function ArgumentTypeError(message){
	this.name = "ArgumentTypeError";
	this.message = message
}

function SendMessageException(message){
	this.name = "SendMessageException";
	this.message = message;
}

module.exports = {
	ArgumentTypeError: ArgumentTypeError,
	SendMessageException: SendMessageException
}