var mysqljs = require('mysql');
var MySQLException = require('../exceptions/MysqlException');

function MySQL() {
    this.pool = mysqljs.createPool({
        connectionLimit: 100
        , host: process.env.DB_HOST
        , user: process.env.DB_USER
        , password: process.env.DB_PASSWORD
        , database: process.env.DB_NAME
    });
    this.today = new Date();
    this.date = this.today.getDate();
    this.month = this.today.getMonth() + 1;
    this.year = this.today.getFullYear();
}
MySQL.prototype.getRoomUsageData = function () {
    var self = this;
    var pool = self.pool;
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {
            if (err) {
                throw new MySQLException.PoolConnectionException("Pool connection error occured.");
            }
            var sqlQuery = "SELECT data.ID, data.room_ID, data.email, SUM(daily_usage.power) AS power, SUM(daily_usage.water) AS water, data.over_usage_power, data.over_usage_water, " + "room.user_ID, room.name, " + "user_registration.first_name, user_registration.last_name " + "FROM data INNER JOIN " + "room ON data.room_ID = room.ID INNER JOIN " + "daily_usage ON data.room_ID = daily_usage.room_ID INNER JOIN " + "user_registration ON room.user_ID = user_registration.ID " + "WHERE user_registration.enable = 1 AND MONTH(daily_usage.dmy) = '" + self.month + "' AND YEAR(daily_usage.dmy) = '" + self.year + "' GROUP BY(data.room_ID)";
            connection.query(sqlQuery, function (error, results, fields) {
                connection.release();
                if (error) {
                    throw new MySQLException.QueryException(error.sqlMessage);
                }
                resolve(results, fields);
            });
        });
    });
}
MySQL.prototype.closePoolConnection = function () {
    var pool = this.pool;
    return new Promise(function (resolve, reject) {
        pool.end(function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(200);
            }
        });
    });
}
module.exports = MySQL;