const mysql = require('mysql');
const _ = require('lodash');

const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

/*
let pool = mysql.createPool({
    host: '69.164.212.85',
    user: 'tkivite',
    password: '1SUPERtitus',
    database: 'cheqmate_test'
});*/

let pool = mysql.createPool({
    host: finalConfig.host,
    user: finalConfig.username,
    password: finalConfig.password,
    database: finalConfig.database
});

let getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};
console.log(finalConfig);
exports.getConnection = getConnection;