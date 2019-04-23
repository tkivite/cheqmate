"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    path: ""
};

// Edit Profile
function editProfile(request, response) {
    if (!validInput(request)) {
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(responseMessage.status_code).send(responseMessage);
    } else {

        let u_token_v = request.headers.user_token,
            ud_token_v = request.headers.device_token,
            u_name_v = request.body.user.u_name_v,
            u_fullname_v = request.body.user.u_fullname_v,
            u_profile_pic_v = request.body.user.u_profile_pic_v,
            u_phone_v = request.body.user.u_phone_v,
            u_confirmation_token_v = request.body.user.u_confirmation_token_v,
            u_email_v = request.body.user.u_email_v;

        let old_email = '',
            old_phone = '',
            u_id_v = 0;



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
        } else if (!u_name_v || u_name_v == '' || ((u_name_v).trim()).length < 1) {
            console.log("Checking uname");
            responseMessage.status_msg = 'User_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!u_fullname_v || u_fullname_v == '' || ((u_fullname_v).trim()).length < 1 || (u_fullname_v.includes("@") || /\d/.test(String(u_fullname_v)))) {
            //check name is  does not contain number or charcter @
            console.log("Checking full name");
            responseMessage.status_msg = 'User_full_name_must_be_entered_correctly';
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
                                    // console.log(result);
                                    if (err) {
                                        conn.rollback(function () {
                                            throw err;
                                        });
                                    } else {

                                        if (result.length > 0) {
                                            u_id_v = result[0].u_id;
                                            console.log(u_id_v);
                                        }


                                        conn.query("select * from users where u_id=? and u_token=? and u_state=1 limit 1", [u_id_v, u_token_v],
                                            function (err, result) {

                                                // console.log(result);

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

                                                    conn.query(" select * from user_devices where ud_user_id= ? and ud_token=? and ud_state=1 and ud_logout=0 limit 1", [u_id_v, ud_token_v],
                                                        function (err, result) {
                                                            console.log(result);
                                                            if (err) {
                                                                conn.rollback(function () {
                                                                    throw err;
                                                                });
                                                            } else if (result.length == 0) {
                                                                responseMessage.status_msg = "User_device_not_exists";
                                                                responseMessage.status_code = 404;
                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                return;
                                                            } else {

                                                                conn.query('select * from users where u_name = ? and u_state=1 and u_id != ? ', [u_name_v, u_id_v], function (err1, rows) {
                                                                    console.log(rows);
                                                                    if (err1) {
                                                                        console.log(err1);
                                                                        response.status(400).send(responseMessage);
                                                                        conn.release();
                                                                        return;
                                                                    } else if (rows.length > 0) {

                                                                        responseMessage.status_msg = 'This_user_name_already_exist';
                                                                        responseMessage.status_code = 409;
                                                                        response.status(409).send(responseMessage);
                                                                        conn.release();
                                                                        return;
                                                                    } else {
                                                                        conn.query('select * from users where u_phone = ? and u_state=1 and u_id != ? ', [u_phone_v, u_id_v], function (err2, rows) {
                                                                            console.log(rows);
                                                                            if (err2) {
                                                                                console.log(err2);
                                                                                response.status(400).send(responseMessage);
                                                                                conn.release();
                                                                                return;
                                                                            } else if (rows.length > 0) {

                                                                                responseMessage.status_msg = 'This_phone_already_exist';
                                                                                responseMessage.status_code = 409;
                                                                                response.status(409).send(responseMessage);
                                                                                conn.release();
                                                                                return;
                                                                            } else {

                                                                                conn.query('select * from users where u_email = ? and u_state=1 and u_id != ? ', [u_email_v, u_id_v], function (err3, rows) {
                                                                                    console.log(rows);
                                                                                    if (err3) {
                                                                                        console.log(err3);
                                                                                        response.status(400).send(responseMessage);
                                                                                        conn.release();
                                                                                        return;
                                                                                    } else if (rows.length > 0) {

                                                                                        responseMessage.status_msg = 'This_email_already_exist';
                                                                                        responseMessage.status_code = 409;
                                                                                        response.status(409).send(responseMessage);
                                                                                        conn.release();
                                                                                        return;
                                                                                    } else {



                                                                                        conn.query("select u_phone,u_email from users where u_id= ?", [u_id_v],
                                                                                            function (err, result) {

                                                                                                if (err) {
                                                                                                    conn.rollback(function () {
                                                                                                        throw err;
                                                                                                    });
                                                                                                } else {
                                                                                                    if (result.length > 0) {
                                                                                                        old_phone = result[0].u_phone;
                                                                                                        old_email = result[0].u_email;
                                                                                                    }

                                                                                                    if (!u_profile_pic_v || u_profile_pic_v == '') {
                                                                                                        conn.query("update users set u_name = ?,u_fullname = ?,u_email = ? where u_id = ?", [u_name_v, u_fullname_v, u_email_v, u_id_v],
                                                                                                            function (err, result) {

                                                                                                                if (err) {
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                } else {

                                                                                                                    responseMessage.status_msg = 'Updated_Successfully';
                                                                                                                    responseMessage.status_code = 201;
                                                                                                                    //   response.status(responseMessage.status_code).send(responseMessage);


                                                                                                                }
                                                                                                            });
                                                                                                    } else {

                                                                                                        conn.query("update users set u_profile_pic = ?,u_name = ?,u_fullname = ?,u_email = ? where u_id = ?", [u_profile_pic_v, u_name_v, u_fullname_v, u_email_v, u_id_v],
                                                                                                            function (err, result) {

                                                                                                                if (err) {
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                } else {

                                                                                                                    responseMessage.status_msg = 'Updated_Successfully';
                                                                                                                    responseMessage.status_code = 201;
                                                                                                                    //response.status(responseMessage.status_code).send(responseMessage);

                                                                                                                }
                                                                                                            });
                                                                                                    }




                                                                                                    if (u_phone_v != old_phone) {
                                                                                                        conn.query("update users set u_phone = ?, u_confirm_phone = 0 where u_id = ?", [u_phone_v, u_id_v],
                                                                                                            function (err, result) {

                                                                                                                if (err) {
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                } else {


                                                                                                                    responseMessage.status_msg = 'phone_changed';
                                                                                                                    responseMessage.status_code = 201;
                                                                                                                    // response.status(responseMessage.status_code).send(responseMessage);

                                                                                                                }
                                                                                                            });


                                                                                                    }

                                                                                                    if (u_email_v != old_email) {

                                                                                                        //conn.query("update users set u_newemail = ?, u_confirm_email = 0, u_confirmation_token = ? where u_id = ?", [u_email_v, u_confirmation_token_v, u_id_v],

                                                                                                        conn.query("update users set u_newemail = ?, u_confirm_email = 0 where u_id = ?", [u_email_v, u_id_v],
                                                                                                            function (err, result) {

                                                                                                                if (err) {
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                } else {


                                                                                                                    responseMessage.status_msg = 'email_changed';
                                                                                                                    responseMessage.status_code = 201;
                                                                                                                    //response.status(responseMessage.status_code).send(responseMessage);

                                                                                                                }
                                                                                                            });
                                                                                                    }
                                                                                                }
                                                                                            });





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
    editProfile: editProfile
};