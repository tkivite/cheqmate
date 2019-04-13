const mysql = require('mysql');

let pool = mysql.createPool({
    host: '69.164.212.85',
    user: 'tkivite',
    password: '1SUPERtitus',
    database: 'cheqmate_test'
});

let getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};

exports.getConnection = getConnection;