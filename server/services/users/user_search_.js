"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
    status_msg: "false",
    status_code: 400,
    friends: {
        friend_name: '',
        friend_code: '',
        friend_profile_pic: '',
        state: 0
    }
};
// User Search
function userSearch(request, response) {
    if (!validInput(request)) {
        responseMessage.status_code = 400;
        console.log("invalid data");
        response.status(responseMessage.status_code).send(responseMessage);
    } else {

        let search_txt_v = request.body.search_txt_v,
            u_token_v = request.body.u_token_v,
            ud_token_v = request.body.ud_token_v,
            start_limit = request.body.start_limit,
            search_key = request.body.search_key,
            scope = request.body.scope;
        //pp_path = request.body.pp_path;
        let u_id_v = 0,
            search_key_v = '',
            Full_Path = '';



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
        }
        /*else if (UtilityFunctions.isStringEmptyOrNull(pp_path, 1)) {
                   responseMessage.status_msg = "Invalid_profile_picture_path";
                   responseMessage.status_code = 400;
                   response.status(400).send(responseMessage);
                   return;
               } */
        else if (!start_limit || start_limit < 0) {
            responseMessage.status_msg = "Invalid_limit";
            responseMessage.status_code = 400;
            response.status(400).send(responseMessage);
            return;
        } else if (UtilityFunctions.isStringEmptyOrNull(search_key, 1)) {
            responseMessage.status_msg = "Search_key_must_be_entered";
            responseMessage.status_code = 400;
            response.status(400).send(responseMessage);
            return;
        } else if (UtilityFunctions.isStringEmptyOrNull(scope, 1)) {
            responseMessage.status_msg = "Scope_must_be_entered";
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

                                        conn.query("select * from users where u_id=? and u_token=? and u_state=1  limit 1", [u_id_v, u_token_v],
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
                                                    //scope == 'all' or scope == 'not_mine'
                                                    if (scope == 'all' || scope == 'not_mine') {
                                                        if (search_key == 'name') {
                                                            search_key_v = " u_name like '%".concat(search_txt_v, "%'");
                                                        } else if (search_key == 'code') {
                                                            search_key_v = " u_code like '%".concat(search_txt_v, "%'");
                                                        } else if (search_key == 'name_code') {
                                                            search_key_v = " (u_code like '%".concat(search_txt_v, "%' or u_name like '%", search_txt_v, "%') ");
                                                        }

                                                        let query1 = "select * from (select u_token as 'friend_token',u_name as 'friend_name',u_code as 'friend_code',u_profile_pic as 'friend_profile_pic','1' as 'state' from user_friends_request , users_desc	where u_id = ufr_friend_id and ufr_state=0 and ufr_user_id=";

                                                        let set_query = query1.concat(u_id_v, " and ", search_key_v, "	union all select u_token as 'friend_token',u_name as 'friend_name',u_code as 'friend_code',u_profile_pic as 'friend_profile_pic','0' as 'state' from users_desc where u_id!=", u_id_v, " and ", search_key_v, " and u_id not in (select uf_friend_id from user_friends where uf_user_id=", u_id_v, " and uf_state=1) and u_id not in (select ufr_friend_id from user_friends_request where ufr_user_id=", u_id_v, " and ufr_state = 0 ) and u_id not in (select ufr_user_id from user_friends_request where ufr_friend_id=", u_id_v, " and ufr_state = 0 )	) as search_result	limit ", start_limit, " , 21");
                                                        //exec query
                                                        //console.log(set_query);
                                                        conn.query(set_query, [],
                                                            function (err, result) {

                                                                if (err) {
                                                                    conn.rollback(function () {
                                                                        throw err;
                                                                    });
                                                                } else {

                                                                    responseMessage.status_msg = true;
                                                                    responseMessage.status_code = 201;
                                                                    responseMessage.friends = result;
                                                                    response.status(responseMessage.status_code).send(responseMessage);
                                                                    return;
                                                                }
                                                            });
                                                    }
                                                    //scope == 'mine'
                                                    if (scope == 'mine') {

                                                        if (search_key == 'name') {
                                                            search_key_v = " friend_name like '%".concat(search_txt_v, "%'");
                                                        } else if (search_key == 'code') {
                                                            search_key_v = " friend_code like '%".concat(search_txt_v, "%'");
                                                        } else if (search_key == 'name_code') {
                                                            search_key_v = " (friend_code like '%".concat(search_txt_v, "%' or friend_name like '%", search_txt_v, "%' )");

                                                        }
                                                        let query1 = "select u_token as 'friend_token', u_name as 'friend_name',u_code as 'friend_code',u_profile_pic as 'friend_profile_pic',case when ucb_amount>=0 then 'valid' else 'invalid' end as 'validation' from user_friends,users_desc,user_current_balance  where uf_user_id = ";
                                                        let set_query = query1.concat(u_id_v, " and u_id = uf_friend_id and uf_state = 1 and u_id = ucb_user_id having ", search_key_v, "   order by u_name ASC limit ", start_limit, ", 21 ");
                                                        //exec query
                                                        //console.log(set_query);
                                                        conn.query(set_query, [],
                                                            function (err, result) {

                                                                if (err) {
                                                                    conn.rollback(function () {
                                                                        throw err;
                                                                    });
                                                                } else {

                                                                    responseMessage.status_msg = "All_friends_were_successfully_get";
                                                                    responseMessage.status_code = 201;
                                                                    responseMessage.friends = result;
                                                                    response.status(responseMessage.status_code).send(responseMessage);
                                                                    return;
                                                                }
                                                            });
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


    }
}

function validInput(request) {
    console.log(request.body);
    if (!request.body) {
        responseMessage.status_msg = "false";
        return false;
    } else {
        return true;
    }
}
module.exports = {
    userSearch: userSearch
};