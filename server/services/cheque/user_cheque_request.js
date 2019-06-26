"use strict";
const UtilityFunctions = require("../../common/functions");
const mysqlpool = require("../../../configs/mysqlconfig");

let responseMessage = {
  status_msg: "false",
  status_code: 400,
  chq_id_v: "",
  r_name_v: "",
  r_logo_v: "",
  chq_net_amount: "0"
};

// Cheque Request

function chequeRequest(request, response) {
  if (!request.headers.u_token_v) {
    responseMessage.status_code = 400;
    console.log("invalid data");
    response.status(responseMessage.status_code).send(responseMessage);
  } else {
    let u_token_v = request.headers.u_token_v;

    let chq_user_id_v = 0,
      chq_id_vv = 0,
      chqd_id_vv = 0,
      r_name_v = '',
      r_logo_v = '';

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
          chq_user_id_v = result[0].u_id;
        }
        if (result.length === 0) {
          connection.query("COMMIT");
          connection.release();
          responseMessage.status_msg = "User_must_be_selected";
          responseMessage.status_code = 404;
          console.log(responseMessage);
          throw responseMessage;
        }
        if (chq_user_id_v < 1 || chq_user_id_v == null || chq_user_id_v == '') {
          connection.release();
          responseMessage.status_msg = "User_must_be_selected";
          responseMessage.status_code = 400;
          console.log(responseMessage);
          throw responseMessage;
        } else
          //   select ifnull(chqd_id, 0) into chqd_id_vv from cheque_details where chqd_state in (0, 1) and chqd_user_id = chq_user_id_v order by chqd_id DESC limit 1;
          // select ifnull(chq_id, 0) into chq_id_vv from cheque where chq_state in (0, 1) and chq_user_id = chq_user_id_v order by chq_id DESC limit 1;

          return connection.query(
            "select ifnull(chqd_id, 0) from cheque_details where chqd_state in (0, 1) and chqd_user_id = ? order by chqd_id DESC limit 1",
            [chq_user_id_v]
          );
      }).then(function (result) {
        console.log(result);
        console.log(result.length);
        if (result.length > 0) {
          chqd_id_vv = result[0].chqd_id;
        }
        if (chq_id_vv == 0 && chqd_id_vv == 0) {
          connection.release();
          responseMessage.status_msg = "No_pending_cheques";
          responseMessage.status_code = 404;
          console.log(responseMessage);
          throw responseMessage;
        } else
          return connection.query("select * from ( select chq_id as 'chq_id_v',r_name as 'r_name_v'," +
            ", chq_net_amount,chqd_id as 'chqd_id_v',chqd_state as 'state'," +
            "chqd_request_date as 'request_date' from cheque join restaurants_branch_pos on chq_branch_pos_id = rbpos_id" +
            " join restaurants_branch on rbpos_restaurants_branch_id = rb_id " +
            " join restaurants on rb_restaurants_id = r_id join cheque_details on chq_id=chqd_chq_id and chqd_user_id = ?" +
            " where rbpos_state = 1 and rb_state = 1 and r_state = 1 and chqd_state in (0,1)  and chq_state in (0,1)  " +
            " union " +
            " select chq_id as 'chq_id_v',r_name as 'r_name_v'," +
            " chq_net_amount,'-1' as 'chqd_id_v',chq_state as 'state',chq_request_date as 'request_date' from cheque " +
            " join restaurants_branch_pos on chq_branch_pos_id = rbpos_id join restaurants_branch on rbpos_restaurants_branch_id = rb_id " +
            " join restaurants on rb_restaurants_id = r_id where rbpos_state = 1 and rb_state = 1 and r_state = 1 and chq_user_id = ? " +
            " and chq_state in (0,1) ) as pending_chqs group by pending_chqs.chq_id_v order by pending_chqs.chq_id_v DESC", [chq_user_id_v, chq_user_id_v]
          );




      }).then(function (result) {
        if (result) {
          connection.release();
          responseMessage.status_msg = "true";
          responseMessage.status_code = 201;

          responseMessage.chq_id_v = result[0].chq_id_v;
          responseMessage.chqd_id_v = result[0].chqd_id_v;
          responseMessage.r_name_v = result[0].r_name_v;
          responseMessage.r_logo_v = result[0].r_logo_v;
          responseMessage.chq_net_amount = result[0].chq_net_amount;

          console.log(responseMessage);
          throw responseMessage;
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


module.exports = {
  chequeRequest: chequeRequest
};