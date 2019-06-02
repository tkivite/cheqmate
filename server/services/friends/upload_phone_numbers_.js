"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");
let responseMessage = {
  status_msg: "false",
  status_code: 400
};

// Friend Request
function uploadPhoneNumbers(request, response) {
  console.log(request.body);
  if (
    !request.body
  ) {
    responseMessage.status_msg = "false";
    responseMessage.status_code = 400;
    console.log("invalid data");
    response.status(responseMessage.status_code).send(responseMessage);
  } else {


    let u_token_v = request.body.u_token_v,
      ud_token_v = request.body.ud_token_v,
      phone_numbers = request.body.phone_numbers,
      pn_number_v = request.body.pn_number_v,
      pn_country_code_v = request.body.phone_numbers.pn_country_code_v;

    let u_id_v = 0,
      friend_id_v = 0,
      ufr_id_v = 0;


    let number_next = '',
      _nextlen = null,
      _value = '',
      country_code_next = '',
      country_code_nextlen = null,
      country_code_value = '',
      pn_id_v = 0,
      ctry_id_v = null,
      pnn_chqmate_user_id_v = null,
      u_id_v = 0;

    let pn_number_main = '',
      pn_country_code_main = '';


    let pn_number_main = pn_number_v,
      pn_country_code_main = pn_country_code_v;

    let connection;

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
    } else if (UtilityFunctions.isStringEmptyOrNull(pn_number_v, 1)) {
      responseMessage.status_msg = "Phone_numbers_must_be_selected";
      responseMessage.status_code = 400;
      response.status(400).send(responseMessage);
      return;

    } else if (UtilityFunctions.isStringEmptyOrNull(pn_country_code_v, 1)) {
      responseMessage.status_msg = "Country_Code_must_be_selected";
      responseMessage.status_code = 400;
      response.status(400).send(responseMessage);
      return;

    } else {
      mysqlpool.pool
        .getConnection()
        .then(function (conn) {
          connection = conn;
          return connection.query("START TRANSACTION");
        })
        .then(function (rows) {
          let result = connection.query(
            "select u_id from users where u_token = ? and u_state= 1 limit 1",
            [u_token_v]
          );
          return result;
        })
        .then(function (result) {
          console.log(result);
          console.log(result.length);
          if (result.length > 0) {
            u_id_v = result[0].u_id;
            console.log(u_id_v);
          }
          if (result.length === 0) {
            connection.query("COMMIT");
            connection.release();
            responseMessage.status_msg = "User_not_exists";
            responseMessage.status_code = 404;
            console.log(responseMessage);
            throw responseMessage;
          }
          return connection.query(
            "select u_id from users where u_code = ? and u_state = 1 limit 1",
            [friend_code_v]
          );
        })
        .then(function (result1) {
          if (result1.length > 0) {
            friend_id_v = result1[0].u_id;
          }
          return connection.query("select * from users where u_id = ? and u_token = ? and u_state = 1 limit 1", [u_id_v, u_token_v]);
        })
        .then(function (users) {
          if (users.length === 0) {
            connection.query("COMMIT");
            connection.release();
            responseMessage.status_msg = "User_not_exists";
            responseMessage.status_code = 404;
            console.log(responseMessage);
            throw responseMessage;
          } else return connection.query("select * from user_devices where ud_user_id = ? and ud_token = ? and ud_state = 1 and ud_logout = 0 limit 1", [u_id_v, ud_token_v]);
        })
        .then(function (users) {
          if (users.length === 0) {
            connection.query("COMMIT");
            connection.release();
            responseMessage.status_msg = "User_device_not_exists";
            responseMessage.status_code = 404;
            console.log(responseMessage);
            throw responseMessage;
          } else return pn_number_v;
        })
        .then(function (pn_number_v) {
            if (UtilityFunctions.isStringEmptyOrNull(pn_number_v, 1) {

              } else {

                SET number_next = SUBSTRING_INDEX(pn_number_v, ',', 1);
                SET _nextlen = LENGTH(number_next);
                SET _value = TRIM(number_next);
                SET country_code_next = SUBSTRING_INDEX(pn_country_code_v, ',', 1);
                SET country_code_nextlen = LENGTH(country_code_next);
                SET country_code_value = TRIM(country_code_next);
                SET pn_id_v = 0;
                SET ctry_id_v = null;
                SET pnn_chqmate_user_id_v = null;
              } else if (
                request_state_v != 0 &&
                request_state_v != 1 &&
                request_state_v != 2 &&
                request_state_v != 3
              ) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Enter_valid_state";
                responseMessage.status_code = 400;
                console.log(responseMessage);
                throw responseMessage;
              } else if (request_state_v == 0) {
                return connection.query(
                  "select * from user_friends where uf_user_id = ? and uf_friend_id = ? and uf_state = 1",
                  [u_id_v, friend_id_v]
                );
              } else if (request_state_v == 1 || request_state_v == 2) {
                return connection.query(
                  "SELECT ufr_id FROM user_friends_request WHERE ufr_user_id = ? AND ufr_friend_id = ? AND ufr_state = 0 limit 1 ",
                  [friend_id_v, u_id_v]
                );
              } else if (request_state_v == 3) {
                return connection.query(
                  "select * from user_friends_request where ufr_user_id=? and ufr_friend_id= ? and ufr_state=0",
                  [friend_id_v, u_id_v]
                );
              }
            })
          .then(function (friends) {
            if (request_state_v == 0) {
              if (friends.length > 0) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Already_friends";
                responseMessage.status_code = 409;
                console.log(responseMessage);
                throw responseMessage;
              } else
                return connection.query(
                  "select * from user_friends_request where ufr_user_id=? and ufr_friend_id=? and ufr_state=0",
                  [u_id_v, friend_id_v]
                );
            } else if (request_state_v == 1 || request_state_v == 2) {
              if (friends.length > 0) {
                ufr_id_v = friends[0].ufr_id;
              }
              if (ufr_id_v != 0) {
                return connection.query(
                  "update user_friends_request set ufr_state= ? , ufr_reply_date=now()  where ufr_id=?; ",
                  [request_state_v, ufr_id_v]
                );
              } else {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "There_is_no_request";
                responseMessage.status_code = 404;
                console.log(responseMessage);
                throw responseMessage;
              }
            } else if (request_state_v == 3) {
              if (friends.length === 0) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Request_already_send";
                responseMessage.status_code = 409;
                console.log(responseMessage);
                throw responseMessage;
              } else {
                return connection.query(
                  "update user_friends_request  set ufr_state=3, ufr_reply_date =now()   where ufr_user_id= ? and ufr_friend_id= ? and ufr_state=0",
                  [friend_id_v, u_id_v]
                );
              }
            }
          })
          .then(function (friends) {
            if (request_state_v == 0) {
              if (friends.length > 0) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Request_already_send";
                responseMessage.status_code = 409;
                console.log(responseMessage);
                throw responseMessage;
              } else
                return connection.query(
                  "select * from user_friends_request where ufr_user_id=? and ufr_friend_id=? and ufr_state=0",
                  [friend_id_v, u_id_v]
                );
            } else if (request_state_v == 1 || request_state_v == 2) {
              if (request_state_v == 1) {
                connection.query(
                  "insert into user_friends (uf_user_id,uf_friend_id) values (?,?)",
                  [u_id_v, friend_id_v]
                );
                connection.query(
                  "insert into user_friends (uf_user_id,uf_friend_id) values (?,?)",
                  [friend_id_v, u_id_v]
                );
                return connection.query(
                  "insert into user_notification(un_text, un_icon, un_user, un_date)  values(concat(' You and ', (select u_name from users where u_id = ?), ' are now friends'), (select concat('profile_pictures/', u_profile_pic) from users where u_id = ?), ?, now())",
                  [u_id_v, u_id_v, friend_id_v]
                );
              } else {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Request_ignored";
                responseMessage.status_code = 201;
                console.log(responseMessage);
                throw responseMessage;
              }
            } else if (request_state_v == 3) {
              connection.query("COMMIT");
              connection.release();
              responseMessage.status_msg = "Request_canceled";
              responseMessage.status_code = 201;
              console.log(responseMessage);
              throw responseMessage;
            }
          })
          .then(function (friends) {
            if (request_state_v == 0) {
              if (friends.length > 0) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Request_already_send";
                responseMessage.status_code = 409;
                console.log(responseMessage);
                throw responseMessage;
              } else
                return connection.query(
                  "insert into user_friends_request   (ufr_user_id,ufr_friend_id,ufr_request_date)  values    (?,?,now());",
                  [u_id_v, friend_id_v]
                );
            } else if (request_state_v == 1 || request_state_v == 2) {
              if (friends) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "Request_accepted";
                responseMessage.status_code = 201;
                console.log(responseMessage);
                throw responseMessage;
              }
            }
          })
          .then(function (friends) {
            if (request_state_v == 0) {
              if (friends) {
                connection.query("COMMIT");
                connection.release();
                responseMessage.status_msg = "request_send";
                responseMessage.status_code = 201;
                console.log(responseMessage);
                throw responseMessage;
              }

              //} else return connection.query("insert into user_friends_request   (ufr_user_id,ufr_friend_id,ufr_request_date)  values    (?,?,now());", [u_id_v, friend_id_v, ]);
            }
          })
          .catch(function (err) {

            console.log("We have responded with");
            // connection.query("ROLLBACK");
            //if (connection.) connection.release();
            console.log(err);
            response.status(responseMessage.status_code).send(responseMessage);
          });
        }
    }
  }


  module.exports = {
    uploadPhoneNumbers: uploadPhoneNumbers
  };