"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    grn_random_num_v: -1
};
// User Login
function generateRandomNumber(request, response) {
    if (!request.headers) {
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(responseMessage.status_code).send(responseMessage);
    } else {

        let u_token_v = request.headers.user_token,
            ud_token_v = request.headers.device_token;

        let u_id_v = 0,
            grn_random_num_v = 0,
            ud_device_id_v = 0,
            cs_enable_chq_validation_v = 0;


        if (UtilityFunctions.isStringEmptyOrNull(u_token_v, 1)) {
            responseMessage.status_msg = "Invalid_user_token";
            responseMessage.status_code = 400;
            responseMessage.grn_random_num_v = grn_random_num_v;
            response.status(400).send(responseMessage);
            return;
        } else if (UtilityFunctions.isStringEmptyOrNull(ud_token_v, 1)) {
            responseMessage.status_msg = "Invalid_user_device_token";
            responseMessage.status_code = 400;
            responseMessage.grn_random_num_v = grn_random_num_v;
            response.status(400).send(responseMessage);
            return;
        } else {

            mysqlpool.getConnection(function (err, conn) {
                if (err) {
                    console.error("error connecting: " + err.stack);
                    responseMessage.status_msg = "Error connecting to database";
                    responseMessage.status_code = 400;
                    responseMessage.grn_random_num_v = grn_random_num_v;
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
                                                    responseMessage.grn_random_num_v = grn_random_num_v;
                                                    response.status(responseMessage.status_code).send(responseMessage);
                                                    return;
                                                } else {
                                                    u_id_v = result[0].u_id;
                                                    conn.query("select * from user_devices where ud_user_id=? and ud_token=? and ud_logout=0 limit 1", [u_id_v, ud_token_v],
                                                        function (err, result) {
                                                            if (err) {
                                                                conn.rollback(function () {
                                                                    throw err;
                                                                });
                                                            } else if (result.length == 0) {
                                                                responseMessage.status_msg = "User_device_not_exists";
                                                                responseMessage.status_code = 404;
                                                                responseMessage.grn_random_num_v = grn_random_num_v;
                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                return;
                                                            } else {
                                                                conn.query("select cs_enable_chq_validation from chqmate_settings", [],
                                                                    function (err, result) {

                                                                        if (err) {
                                                                            conn.rollback(function () {
                                                                                throw err;
                                                                            });
                                                                        } else {
                                                                            if (result.length > 0) {
                                                                                cs_enable_chq_validation_v = result[0].cs_enable_chq_validation;
                                                                            }

                                                                            if (cs_enable_chq_validation_v == 1) {

                                                                                conn.query("select ud_id from user_devices where ud_token=? and ud_state=1 and ud_logout=0", [ud_token_v],
                                                                                    function (err, result) {
                                                                                        if (err) {
                                                                                            conn.rollback(function () {
                                                                                                throw err;
                                                                                            });
                                                                                        } else {


                                                                                            if (result.length > 0) {
                                                                                                ud_device_id_v = result[0].ud_id || ud_device_id_v;
                                                                                            }

                                                                                            conn.query("select grn_random_num from generate_random_num where grn_user_id=? and grn_user_device_id=? and grn_used=0 limit 1;", [u_id_v, ud_device_id_v],
                                                                                                function (err, result) {

                                                                                                    if (err) {
                                                                                                        conn.rollback(function () {
                                                                                                            throw err;
                                                                                                        });
                                                                                                    } else {
                                                                                                        if (result.length > 0) {
                                                                                                            grn_random_num_v = result[0].grn_random_num || grn_random_num_v;
                                                                                                        }

                                                                                                        if (grn_random_num_v == 0) {

                                                                                                            grn_random_num_v = Math.floor(Math.random() * (99999 - 10000 + 1)) + 1000;

                                                                                                            conn.query("insert into generate_random_num (grn_random_num, grn_user_id, grn_user_device_id, grn_date)  values (?,?,?,now())", [grn_random_num_v, u_id_v, ud_device_id_v],
                                                                                                                function (err, result) {
                                                                                                                    if (err) {
                                                                                                                        conn.rollback(function () {
                                                                                                                            throw err;
                                                                                                                        });
                                                                                                                    } else {
                                                                                                                        responseMessage.status_msg = "Random_Generated";
                                                                                                                        responseMessage.status_code = 201;
                                                                                                                        responseMessage.grn_random_num_v = grn_random_num_v;

                                                                                                                        conn.commit(function (err) {
                                                                                                                            if (err) {
                                                                                                                                conn.rollback(function () {
                                                                                                                                    throw err;
                                                                                                                                });
                                                                                                                                // responseMessage.status_msg = 'The_Record_has_been_successfully_saved';
                                                                                                                                //responseMessage.status_code = 201;
                                                                                                                                response.status(400).send(responseMessage);
                                                                                                                                conn.release();
                                                                                                                                return;


                                                                                                                            } else {
                                                                                                                                response.status(responseMessage.status_code).send(responseMessage);
                                                                                                                                conn.release();
                                                                                                                                return;
                                                                                                                            }
                                                                                                                        });
                                                                                                                        // response.status(responseMessage.status_code).send(responseMessage);


                                                                                                                    }

                                                                                                                });
                                                                                                        } else {
                                                                                                            responseMessage.status_msg = "Random_Generated";
                                                                                                            responseMessage.status_code = 201;
                                                                                                            responseMessage.grn_random_num_v = grn_random_num_v;
                                                                                                            response.status(responseMessage.status_code).send(responseMessage);

                                                                                                        }


                                                                                                    }





                                                                                                });


                                                                                        }
                                                                                    });
                                                                            } else {

                                                                                grn_random_num_v = 0;
                                                                                responseMessage.status_msg = "cheque_validation_disabled";
                                                                                responseMessage.status_code = 404;
                                                                                responseMessage.grn_random_num_v = grn_random_num_v;
                                                                                response.status(responseMessage.status_code).send(responseMessage);
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
                    })
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
    generateRandomNumber: generateRandomNumber
};