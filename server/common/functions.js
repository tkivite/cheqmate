const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('../config');
//const bcrypt = require('bcrypt');
const crypto = require('crypto');
const saltRounds = 10;
exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};
exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'] || req.headers['token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                let err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                //checkPermission
                next();
            }
        });
    } else {
        let err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.generateMD5 = function (str, next) {
    return crypto.createHash('md5').update(str).digest("hex");
};


exports.generateRandom = function (length, next) {
    let rdm = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        rdm += possible.charAt(Math.floor(Math.random() * possible.length));
    return rdm;
};

exports.getDateTime = function (next) {

    let date = new Date();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + "-" + hour + "-" + min + "-" + sec;

};

exports.validateEmail = function (email, next) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

exports.validateName = function (name, next) {
    var re = /^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$/;
    return re.test(String(name));
}
exports.validatePhone = function (phone, next) {
    var re = /^[+]?[0-9.-]+$/;
    return re.test(String(phone));
}
exports.userGenerateCode = function (u_id_v, next) {
    let User_MOD = (u_id_v - 1) % 10;
    let User_DIV = Math.floor(u_id_v / 10);
    let User_Num = (1048576 + ((15728640 / 10) * User_MOD)) + User_DIV;
    return User_Num.toString(16);
    //return u_code_v;
}

exports.isStringEmptyOrNull = function (strn, length = 1) {
    return !strn || strn == '' || (strn.trim().length) < length;
}

exports.userToken = function (u_id_v, u_code_v, register_date, country_id, next) {

    // str1.padStart(5, '0')
    let date = new Date(register_date);

    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    let day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    let token = (day.toString().padStart(2, '0')).concat(month.toString().padStart(2, '0'), year.toString().padStart(4, '0'), hour.toString().padStart(2, '0'), min.toString().padStart(2, '0'), u_code_v, country_id, u_id_v.toString().padStart(8, '0'), 'ASEWp89WEA');
    let u_token_v = 'FFF'.concat(this.generateMD5(token), 'EEE');
    return u_token_v;
}
exports.userDevicesToken = function (u_id_v, ud_id_v, u_code_v, register_date, device_type) {


    if (device_type = 'android')
        device_type_v = 1;
    else device_type_v = 2;
    let date = new Date();
    //date.setTime(result_from_Date_getTime);
    let seconds = date.getSeconds();
    let minutes = date.getMinutes();
    let hour = date.getHours();
    let year = date.getFullYear();
    let month = date.getMonth(); // beware: January = 0; February = 1, etc.
    let day = date.getDate();
    //let dayOfWeek = date.getDay(); // Sunday = 0, Monday = 1, etc.
    //let milliSeconds = date.getMilliseconds();

    token = (day.toString().padStart(2, '0')).concat((month + 1).toString().padStart(2, '0'), year.toString().padStart(4, '0'), hour.toString().padStart(2, '0'), minutes.toString().padStart(2, '0'), u_code_v, device_type_v, ud_id_v.toString().padStart(8, '0'), 'ASEYp829WAR');
    return 'TTT'.concat(this.generateMD5(token), 'DDD');

}