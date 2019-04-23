"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    data: {
        friend_token: '',
        friend_name: '',
        friend_code: '',
        friend_profile_pic: ''
    }
};

// Friend Requests
function userFriendRequests(request, response) {
    if (!validInput(request)) {
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(responseMessage.status_code).send(responseMessage);
    } else {

        let u_token_v = request.body.user.u_token_v,
            ud_token_v = request.body.user.ud_token_v;

        let u_id_v = 0;



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

                                        conn.query("select * from users where u_id=? and u_token=? and u_state=1 and (u_confirm_phone=1 or u_confirm_email=1) limit 1", [u_id_v, u_token_v],
                                            function (err, result) {

                                                if (err) {
                                                    conn.rollback(function () {
                                                        throw err;
                                                    });
                                                } else if (result.length == 0) {
                                                    responseMessage.status_msg = "User_not_exists";
                                                    responseMessage.status_code = 404;
                                                    //response.status(responseMessage.status_code).send(responseMessage);
                                                    return;
                                                } else {

                                                    conn.query("select * from user_devices where ud_user_id = ? and ud_token= ? and ud_state=1 and ud_logout=0 limit 1", [u_id_v, ud_token_v],
                                                        function (err, result) {
                                                            console.log(result);
                                                            if (err) {
                                                                conn.rollback(function () {
                                                                    throw err;
                                                                });
                                                            } else if (result.length == 0) {
                                                                responseMessage.status_msg = "User_device_not_exists";
                                                                responseMessage.status_code = 404;
                                                                // response.status(responseMessage.status_code).send(responseMessage);
                                                                return;
                                                            } else {


                                                                conn.query("select u_name as 'friend_name',u_code 'friend_code',u_profile_pic as 'friend_profile_pic'  from user_friends_request , users  where ufr_friend_id = ? and u_id=ufr_user_id and ufr_state=0;", [u_id_v],
                                                                    function (err, result) {

                                                                        if (err) {
                                                                            conn.rollback(function () {
                                                                                throw err;
                                                                            });
                                                                        } else {

                                                                            responseMessage.status_msg = true;
                                                                            responseMessage.status_code = 201;
                                                                            //response.status(responseMessage.status_code).send(responseMessage);
                                                                            responseMessage.data = result;



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





function validInput(request) {
    console.log(request.body);
    if (!request.body ||
        !request.body.user
    ) {
        responseMessage.status_msg = "false";
        return false;
    } else {
        return true;
    }
}
module.exports = {
    userFriendRequests: userFriendRequests
};