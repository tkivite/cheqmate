'use strict';
const UtilityFunctions = require('../../common/functions');
const mysqlpool = require('../../../configs/mysqlconfig');

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    user: {
        u_code_v: "",
        u_token_v: "",
        ud_token_v: "",
    }
}




let ournewuser = {};
let ournewuserdevice = {};


// Register new users
function registerUser(request, response) {


    if (!validInput(request)) {
        //response.json(httpMessages.onValidationError);
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(400).send(responseMessage);

        return;

    } else {

        let u_name_v = request.body.user.u_name_v,
            u_fullname_v = request.body.user.u_fullname_v,
            u_country_id_v = request.body.user.u_country_id_v,
            u_login_type_v = request.body.user.u_login_type_v,
            u_email_v = request.headers.user_email,
            u_third_party_token_v = request.body.user.u_third_party_token_v,
            u_password_v = request.headers.user_password,
            //u_token = request.body.user.u_token_v,
            u_phone_v = request.body.user.u_phone_v,
            ud_device_type_v = request.body.user_device.ud_device_type_v,
            ud_device_version_v = request.body.user_device.ud_device_version_v,
            ud_app_version_v = request.body.user_device.ud_app_version_v,
            ud_device_id_v = request.body.user_device.ud_device_id_v,
            usl_ip_v = request.body.user_login.usl_ip_v,
            usl_mac_v = request.body.user_login.usl_mac_v,
            u_confirmation_token_v = UtilityFunctions.generateRandom(30);

        let u_profile_pic_v = 'pp.png';
        /**Enable later. Heroku wont handle this */
        /*	if(image_encoded !="")
            {		
                u_profile_pic_v = UtilityFunctions.getDateTime()  + ".jpg";			
                    
                let dir = "../profile_pictures";
    
                if (!fs.existsSync(dir)){
                    fs.mkdirSync(dir);
                }
                const location = "../profile_pictures/"+ u_profile_pic_v;   
                //$current = file_get_contents($location);      
                //const current = base64_decode(image_encoded); 
                let current = new Buffer(image_encoded, 'base64');  
                fs.writeFileSync(location, current);		
            
                }*/
        /** End of Heroku hosting fix */

        let u_code_v, u_token_v, ud_token_v, u_id_v, ud_id_v, usl_state_v;
        // let status_msg = 'false',response.status(400).send(responseMessage);

        // console.log();

        if (!u_name_v || u_name_v == '' || ((u_name_v).trim()).length < 1) {
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
        } else if (!UtilityFunctions.validateEmail(u_email_v)) {
            responseMessage.status_msg = 'Email_must_be_entered_correctly';
            response.status(400).send(responseMessage);
            return;
        } else if (!u_password_v || u_password_v == '' || ((u_password_v).trim()).length < 5) {
            //check name is  does not contain number or charcter @
            responseMessage.status_msg = 'Password_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!u_phone_v || u_phone_v == '' || ((u_phone_v).trim()).length < 7 || !UtilityFunctions.validatePhone(u_phone_v)) {
            //check name is  does not contain number or charcter @
            responseMessage.status_msg = 'Phone_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!u_login_type_v || u_login_type_v == '' || ((u_login_type_v).trim()).length < 1) {
            responseMessage.status_msg = 'Login_type_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (u_login_type_v != 'chqmate' && (u_third_party_token_v == '' || !u_third_party_token_v || ((u_third_party_token_v).trim()).length < 1)) {
            responseMessage.status_msg = 'third_party_token_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (ud_device_type_v != 'ios' && ud_device_type_v != 'android') {
            responseMessage.status_msg = 'Device_type_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!ud_device_version_v || ud_device_version_v == '' || ((ud_device_version_v).trim()).length < 1) {
            responseMessage.status_msg = 'Device_version_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!ud_device_id_v || ud_device_id_v == '' || ((ud_device_id_v).trim()).length < 1) {
            responseMessage.status_msg = 'Device_id_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        } else if (!ud_app_version_v || ud_app_version_v == '' || ((ud_app_version_v).trim()).length < 1) {
            responseMessage.status_msg = 'App_version_must_be_entered';
            response.status(400).send(responseMessage);
            return;
        }



        mysqlpool.getConnection(function (err, conn) {
            if (err) {
                console.error('error connecting: ' + err.stack);
                responseMessage.status_msg = "Error connecting to database";
                responseMessage.status_code = 400;
                console.log("invalid data");
                response.status(400).send(responseMessage);
                return;

            } else {

                conn.query('select * from users where u_name = ? and u_state != 0 ', [u_name_v], function (err1, rows) {
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
                        conn.query('select * from users where u_phone = ? and u_state != 0 ', [u_phone_v], function (err2, rows) {
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
                            } else


                            {

                                conn.query('select * from users where u_email = ? and u_state != 0 ', [u_email_v], function (err3, rows) {
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

                                        conn.query('select * from users where u_third_party_token = ? and u_state != 0 and ? != \'\' ', [u_third_party_token_v, u_third_party_token_v], function (err4, rows) {
                                            console.log(rows);
                                            if (err4) {
                                                console.log(err4);
                                                response.status(400).send(responseMessage);
                                                conn.release();
                                                return;
                                            } else if (rows.length > 0) {
                                                responseMessage.status_msg = 'This_third_party_token_already_exists';
                                                responseMessage.status_code = 409;
                                                response.status(409).send(responseMessage);
                                                conn.release();
                                                return;
                                            } else {

                                                conn.beginTransaction(function (err) {

                                                    if (err) {
                                                        throw err;
                                                    } else {


                                                        conn.query('INSERT into users (u_name,u_fullname,u_email,u_newemail,u_password,u_phone,u_confirmation_token,' +
                                                            'u_profile_pic,u_register_date,u_country_id,u_login_type,u_third_party_token,u_token)' +
                                                            ' values (?,?,?,?,?,?,?,?,NOW(),?,?,?,?)', [u_name_v, u_fullname_v, u_email_v, u_email_v, UtilityFunctions.generateMD5(u_password_v), u_phone_v, u_confirmation_token_v, u_profile_pic_v, u_country_id_v, u_login_type_v, u_third_party_token_v, ''],
                                                            function (err, result) {
                                                                if (err) {
                                                                    conn.rollback(function () {
                                                                        throw err;
                                                                    });
                                                                } else {
                                                                    console.log("user inserted" + result);
                                                                    console.log(result);
                                                                    //ournewuser = result;  




                                                                    u_id_v = result.insertId;

                                                                    conn.query('select * from users where u_id = ?', [u_id_v],
                                                                        function (err, result) {
                                                                            if (err) {
                                                                                conn.rollback(function () {
                                                                                    throw err;
                                                                                });
                                                                            }
                                                                            console.log("FETching user");

                                                                            ournewuser = result[0];
                                                                            console.log(ournewuser);
                                                                        });



                                                                    conn.query('INSERT into user_devices(ud_user_id,ud_device_type,ud_device_version,ud_device_id,ud_token,ud_app_version,ud_register_date)' +
                                                                        ' values (?,?,?,?,?,?,NOW())', [u_id_v, ud_device_type_v, ud_device_version_v, ud_device_id_v, '', ud_app_version_v],
                                                                        function (err, result) {
                                                                            if (err) {
                                                                                conn.rollback(function () {
                                                                                    throw err;
                                                                                });
                                                                            } else {
                                                                                console.log("user_device created" + result);
                                                                                console.log(result);
                                                                                // ournewuserdevice = result;
                                                                                ud_id_v = result.insertId;


                                                                                conn.query('select * from user_devices where ud_id = ?', [ud_id_v],
                                                                                    function (err, result) {
                                                                                        if (err) {
                                                                                            conn.rollback(function () {
                                                                                                throw err;
                                                                                            });
                                                                                        }
                                                                                        console.log("FETching user device");
                                                                                        console.log(result);
                                                                                        ournewuserdevice = result[0];
                                                                                    });

                                                                                u_code_v = UtilityFunctions.userGenerateCode(u_id_v);
                                                                                responseMessage.user.u_code_v = u_code_v;
                                                                                let register_date = ournewuser.u_register_date;
                                                                                console.log("FETching country id");
                                                                                let country_id = ((ournewuser.u_country_id).toString()).padStart(4, '0');
                                                                                u_token_v = UtilityFunctions.userToken(u_id_v, u_code_v, register_date, country_id);
                                                                                responseMessage.user.u_token_v = u_token_v;
                                                                                // ud_registtilityFunctions.userToken(u_id_v, u_code_v, register_date, country_id);
                                                                                let ud_register_date = ournewuserdevice.ud_register_date;
                                                                                let device_type = ournewuserdevice.ud_device_type;
                                                                                ud_token_v = UtilityFunctions.userDevicesToken(u_id_v, ud_id_v, u_code_v, ud_register_date, device_type);

                                                                                responseMessage.user.ud_token_v = ud_token_v;


                                                                                conn.query('insert into user_devices_token (udt_device_id,udt_token,udt_date)' +
                                                                                    ' values (?,?,NOW())', [ud_id_v, ud_token_v],
                                                                                    function (err, result) {
                                                                                        if (err) {
                                                                                            conn.rollback(function () {
                                                                                                throw err;
                                                                                            });
                                                                                        } else {
                                                                                            console.log("user_device token created" + result);


                                                                                            conn.query('insert into user_current_balance (ucb_user_id,ucb_amount,ucb_points,ucb_cumulative_payments,ucb_cumulative_charge,ucb_cumulative_points,ucb_last_update) ' +
                                                                                                ' values (?,0,0,0,0,0,NOW())', [u_id_v],
                                                                                                function (err) {
                                                                                                    if (err) {
                                                                                                        conn.rollback(function () {
                                                                                                            throw err;
                                                                                                        });
                                                                                                    }

                                                                                                    if (!u_code_v || u_code_v == '' || ((u_code_v).trim()).length < 1) {
                                                                                                        responseMessage.status_msg = 'User_code_must_be_generated';
                                                                                                        responseMessage.status_code = 400;
                                                                                                        response.status(400).send(responseMessage);

                                                                                                    } else if (!ud_token_v || ud_token_v == '' || ((ud_token_v).trim()).length < 1) {
                                                                                                        responseMessage.status_msg = 'User_device_token_must_be_generated';
                                                                                                        responseMessage.status_code = 400;
                                                                                                        console.log(responseMessage);
                                                                                                    }


                                                                                                    conn.query('select * from users where u_code = ? and u_state != 2 ', [u_code_v], function (err4, rows) {
                                                                                                        console.log(rows);
                                                                                                        if (err4) {
                                                                                                            conn.rollback(function () {
                                                                                                                throw err;
                                                                                                            });
                                                                                                        } else if (rows.length > 0) {
                                                                                                            responseMessage.status_msg = 'Generated_user_code_already_exists';
                                                                                                            responseMessage.status_code = 409;
                                                                                                            response.status(409).send(responseMessage);
                                                                                                            conn.rollback(function () {
                                                                                                                throw err;
                                                                                                            });
                                                                                                            conn.release();
                                                                                                            return;
                                                                                                        } else {
                                                                                                            conn.query('select * from users,user_devices where u_id = ud_user_id and ud_token= ? and ud_state != 2 and u_state != 2 ', [ud_token_v], function (err4, rows) {
                                                                                                                console.log(rows);
                                                                                                                if (err4) {
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                } else if (rows.length > 0) {
                                                                                                                    responseMessage.status_msg = 'Generated_user_device_token_already_exists';
                                                                                                                    responseMessage.status_code = 409;
                                                                                                                    response.status(409).send(responseMessage);
                                                                                                                    conn.rollback(function () {
                                                                                                                        throw err;
                                                                                                                    });
                                                                                                                    conn.release();
                                                                                                                    return;
                                                                                                                } else {


                                                                                                                    conn.query('update users set u_code=? , u_token=? where u_id=? ', [u_code_v, u_token_v, u_id_v], function (err4, rows) {
                                                                                                                        console.log(rows);
                                                                                                                        if (err4) {
                                                                                                                            conn.rollback(function () {
                                                                                                                                throw err;
                                                                                                                            });
                                                                                                                        } else {
                                                                                                                            conn.query('update user_devices set ud_token=?,ud_app_version=? where ud_id=?', [ud_token_v, ud_app_version_v, ud_id_v], function (err4, rows) {
                                                                                                                                console.log(rows);
                                                                                                                                if (err4) {
                                                                                                                                    conn.rollback(function () {
                                                                                                                                        throw err;
                                                                                                                                    });
                                                                                                                                } else {

                                                                                                                                    usl_state_v = 1;



                                                                                                                                    //commit here      

                                                                                                                                    responseMessage.status_msg = 'The_Record_has_been_successfully_saved';
                                                                                                                                    responseMessage.status_code = 201;
                                                                                                                                    // response.status(201).send(responseMessage);
                                                                                                                                    if (usl_state_v = 1) {
                                                                                                                                        conn.query('insert into users_signup_log (usl_name,usl_fullname,usl_email,usl_password,usl_phone,usl_login_type,usl_third_party_token,usl_device_type,usl_device_version,usl_device_id,usl_ip,usl_mac,usl_date,usl_state,usl_app_version)' +
                                                                                                                                            'values(?,?,?,?,?,?,?,?,?,?,?,?, NOW(),?,?)', [u_name_v, u_fullname_v, u_email_v, UtilityFunctions.generateMD5(u_password_v), u_phone_v, u_login_type_v, u_third_party_token_v, ud_device_type_v, ud_device_version_v, ud_device_id_v, usl_ip_v, usl_mac_v, usl_state_v, ud_app_version_v],
                                                                                                                                            function (err) {
                                                                                                                                                if (err) {
                                                                                                                                                    conn.rollback(function () {
                                                                                                                                                        throw err;
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                    } else {

                                                                                                                                        conn.query('insert into users_signup_log (usl_name,usl_fullname,usl_email,usl_password,usl_phone,usl_login_type,usl_third_party_token,usl_device_type,usl_device_version,usl_device_id,usl_ip,usl_mac,usl_date,usl_state,usl_app_version)' +
                                                                                                                                            'values(?,?,?,?,?,?,?,?,?,?,?,?, NOW(),?,?)', [u_name_v, u_fullname_v, u_email_v, u_password_v, u_phone_v, u_login_type_v, u_third_party_token_v, ud_device_type_v, ud_device_version_v, ud_device_id_v, usl_ip_v, usl_mac_v, usl_state_v, ud_app_version_v],
                                                                                                                                            function (err) {
                                                                                                                                                if (err) {
                                                                                                                                                    conn.rollback(function () {
                                                                                                                                                        throw err;
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                    }

                                                                                                                                    conn.commit(function (err) {
                                                                                                                                        if (err) {
                                                                                                                                            conn.rollback(function () {
                                                                                                                                                throw err;
                                                                                                                                            });
                                                                                                                                            // responseMessage.status_msg = 'The_Record_has_been_successfully_saved';
                                                                                                                                            //responseMessage.status_code = 201;
                                                                                                                                            response.status(400).send(responseMessage);
                                                                                                                                            conn.end();
                                                                                                                                            return;


                                                                                                                                        } else {
                                                                                                                                            response.status(201).send(responseMessage);
                                                                                                                                            console.log('Transaction Complete.');
                                                                                                                                            conn.end();
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
        });
    }
}




function validInput(request) {
    console.log(request.body);
    let validData = false;
    if (!request.body || !request.body.user || !request.body.user_device || !request.body.user_login) {
        responseMessage.status_msg = "false";
        return validData;
    } else {
        validData = true;
    }
    return validData;
}

module.exports = {
    registerUser: registerUser
};