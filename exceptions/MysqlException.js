
function PoolConnectionException(message){
	this.name = "PoolConnectionException";
	this.message = message
}

function QueryException(message){
	this.name = "QueryException";
	this.message = message;
}

module.exports = {
	PoolConnectionException: PoolConnectionException,
	QueryException: QueryException
}