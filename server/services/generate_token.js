const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const config = require('../config');
//const bcrypt = require('bcrypt');
//const saltRounds = 10;
exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};
exports.verifyOrdinaryUser = function(req, res, next) {
    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers['Authorization'] || req.headers['token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function(err, decoded) {
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