"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400,

    user: {
        u_name: "",
        u_fullname: "",
        u_code: "",
        u_phone: "",
        u_profile_pic: "",
        ucb_amount: "",
        ucb_points: "",
        cur_code: "",
        u_confirm_email: ""
    }
};

// User Profile
function userProfile(request, response) {
    if (!validInput(request)) {
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(responseMessage.status_code).send(responseMessage);
    } else {

        let u_token_v = request.body.user.u_token_v,
            ud_token_v = request.body.user.ud_token_v,
            pp_path = request.body.user.pp_path;
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

                                                    conn.query("select * from users where u_id=? and u_token=? and u_state=1 and (u_confirm_phone=1 or u_confirm_email=1) limit 1", [u_id_v, u_token_v],
                                                        function (err, result) {

                                                            if (err) {
                                                                conn.rollback(function () {
                                                                    throw err;
                                                                });
                                                            } else if (result.length == 0) {
                                                                responseMessage.status_msg = "User_not_exists";
                                                                responseMessage.status_code = 404;
                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                return;
                                                            } else {

                                                                conn.query("select u_name,u_fullname,u_code,u_phone, CONCAT(?,'profile_pictures/',u_profile_pic) as 'u_profile_pic', ifnull(ucb_amount,0) as 'ucb_amount',ifnull(ucb_points,0) as 'ucb_points',cur_code as 'cur_code', case when u_confirm_email=1 then u_email else u_newemail end as 'u_email' ,u_confirm_email from users left join user_current_balance on u_id=ucb_user_id join countries on ctry_id=u_country_id  join currencies on ctry_cur_id=cur_id where u_id= ? ", [pp_path, u_id_v],
                                                                    function (err, result) {

                                                                        if (err) {
                                                                            conn.rollback(function () {
                                                                                throw err;
                                                                            });
                                                                        } else {

                                                                            responseMessage.user.u_name = result[0].uname;
                                                                            responseMessage.user.u_fullname = result[0].u_fullname;
                                                                            responseMessage.user.u_code = result[0].u_code;
                                                                            responseMessage.user.u_phone = result[0].u_phone;
                                                                            responseMessage.user.u_profile_pic = result[0].u_profile_pic;
                                                                            responseMessage.user.ucb_amount = result[0].ucb_amount;
                                                                            responseMessage.user.ucb_points = result[0].ucb_points;
                                                                            responseMessage.user.cur_code = result[0].cur_code;
                                                                            responseMessage.user.u_confirm_email = result[0].u_confirm_email


                                                                            responseMessage.status_msg = true;
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


                                                                            response.status(responseMessage.status_code).send(responseMessage);
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
    userProfile: userProfile
};