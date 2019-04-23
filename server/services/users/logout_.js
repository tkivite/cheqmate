'use strict';

"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400
};

// User Profile
function userLogout(request, response) {
    if (!request.headers) {
        responseMessage.status_code = 400;
        console.log("invalid data")
        response.status(responseMessage.status_code).send(responseMessage)

    } else {

        let u_token_v = request.headers.user_token,
            ud_token_v = request.headers.device_token;

        let u_id_v = 0,
            ud_id_v = 0;


        if (UtilityFunctions.isStringEmptyOrNull(u_token_v, 1)) {
            responseMessage.status_msg = "Invalid_user_token";
            responseMessage.status_code = 400;
            response.status(400).send(responseMessage);
            return;
        } else if (UtilityFunctions.isStringEmptyOrNull(ud_token_v, 1)) {
            responseMessage.status_msg = "Invalid_user_device_token";
            responseMessage.status_code = 400;
            response.status(400).send(responseMessage);
            return;
        } else {

            mysqlpool.getConnection(function (err, conn) {
                if (err) {
                    console.error("error connecting: " + err.stack);
                    responseMessage.status_msg = "Error connecting to database";
                    responseMessage.status_code = 400;
                    response.status(400).send(responseMessage);
                    return;
                } else {
                    conn.beginTransaction(function (err) {
                        if (err) {
                            throw err;
                        } else {
                            conn.query("select u_id from users where u_token = ? and u_state= 1 limit 1", [u_token_v],
                                function (err, result) {
                                    console.log(result);
                                    if (err) {
                                        conn.rollback(function () {
                                            throw err;
                                        });
                                    } else {

                                        if (result.length > 0) {
                                            u_id_v = result[0].u_id;
                                        }

                                        conn.query(" select ud_id from user_devices where ud_token = ? and ud_state=1 and ud_logout=0 limit 1", [ud_token_v],
                                            function (err, result) {
                                                console.log(result);
                                                if (err) {
                                                    conn.rollback(function () {
                                                        throw err;
                                                    });
                                                } else {

                                                    if (result.length > 0) {
                                                        ud_id_v = result[0].ud_id;
                                                    }

                                                    conn.query("select * from users where u_id=? and u_token=? and u_state=1 limit 1", [u_id_v, u_token_v],
                                                        function (err, result) {

                                                            if (err) {
                                                                conn.rollback(function () {
                                                                    throw err;
                                                                });
                                                            } else if (result.length == 0) {
                                                                responseMessage.status_msg = "User_not_exists";
                                                                responseMessage.status_code = 404;
                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                conn.release();
                                                                return;
                                                            } else {

                                                                conn.query("select ud_id  from users,user_devices where u_id=? and u_id=ud_user_id and u_token = ? and ud_token=?", [u_id_v, u_token_v, ud_token_v],
                                                                    function (err, result) {
                                                                        console.log(result);
                                                                        if (err) {
                                                                            conn.rollback(function () {
                                                                                throw err;
                                                                            });
                                                                        } else {

                                                                            if (result.length > 0) {
                                                                                ud_id_v = result[0].ud_id;
                                                                            }


                                                                            if (ud_id_v != 0) {

                                                                                conn.query("update user_devices set ud_logout = 1 where ud_id = ?", [ud_id_v],
                                                                                    function (err, result) {
                                                                                        console.log(result);
                                                                                        if (err) {
                                                                                            conn.rollback(function () {
                                                                                                throw err;
                                                                                            });
                                                                                        } else {

                                                                                            responseMessage.status_msg = "logout";
                                                                                            responseMessage.status_code = 201;

                                                                                            conn.commit(function (err) {
                                                                                                if (err) {
                                                                                                    conn.rollback(function () {
                                                                                                        throw err;
                                                                                                    });
                                                                                                    response.status(400).send(responseMessage);
                                                                                                    conn.release();
                                                                                                    return;


                                                                                                } else {
                                                                                                    response.status(responseMessage.status_code).send(responseMessage);
                                                                                                    conn.release();
                                                                                                    return;
                                                                                                }
                                                                                            });


                                                                                        }

                                                                                    });
                                                                            } else {

                                                                                responseMessage.status_msg = "incorrect_data";
                                                                                responseMessage.status_code = 400;
                                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                                conn.release();
                                                                                return;


                                                                            }
                                                                        }
                                                                    });
                                                            }
                                                        });
                                                }
                                            });
                                    }
                                });
                        }
                    });
                }
            });



        }
    }

}
module.exports = {
    userLogout: userLogout
};
/*const db = require('../../sequalize/models/index');

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    user: {
        u_phone: "",
        u_token: "",
        ud_token: ""
    }

}

function userLogout(request, response) {
    responseMessage = {
        status_msg: "false",
        status_code: 400
    };
    if (!request.headers) {
        responseMessage.status_code = 400;
        console.log("invalid data")
        response.status(responseMessage.status_code).send(responseMessage)

    } else {
        let
            user_token = request.headers.u_token_v,
            device_token = request.headers.ud_token_v;

        db.sequelize.query('call user_logout(:user_token,:device_token,@status_msg,@status_code)', {
                replacements: {
                    user_token: user_token,
                    device_token: device_token
                }
            })
            .then(() => {
                let query1 = "SELECT @status_msg as status_msg,@status_code as status_code ";
                db.sequelize.query(query1)
                    .then(res => {
                        responseMessage.status_code = res[0][0].status_code;
                        responseMessage.status_msg = res[0][0].status_msg;
                        response.status(responseMessage.status_code).send(responseMessage);
                    }).catch(err1 => {
                        console.log('**********ERROR IN CHECKING PREVIOUS QUERY RESULTS****************');
                        console.log(err1);
                        response.status(400).send(responseMessage);
                    });
                //console.log(responses[1]);// report details)
            }).catch(err => {
                console.log('**********ERROR IN RESULT****************');
                console.log(err);
                response.status(400).send(responseMessage);
            });

    }
}

module.exports = {
    userLogout: userLogout
};
*/