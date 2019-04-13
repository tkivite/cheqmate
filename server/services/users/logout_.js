'use strict';
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