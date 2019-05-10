//const mysql = require('mysql');
const mysql = require("promise-mysql");
const _ = require('lodash');

const config = require('./config.json');
const defaultConfig = config.development;
const environment = process.env.NODE_ENV || 'development';
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);

console.log('node process env NODE_ENV:');
console.log(environment);




let pool = mysql.createPool({
    host: finalConfig.host,
    user: finalConfig.username,
    password: finalConfig.password,
    database: finalConfig.database,
    connectionLimit: 10
});

let getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection);
    });
};

let getConnection_ = () => {
    //return pool.getConnection;
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err)
                return reject(err);
            return resolve(connection);
        });
    });
};



exports.getConnection = getConnection;
exports.getPoolAsPromise = getConnection_;
exports.pool = pool;