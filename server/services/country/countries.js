'use strict';
const mysqlpool = require('../../../configs/mysqlconfig');
// fetch countries

let responseMessage = {
    status_msg: "false",
    status_code: 400

}

function fetchCountries(request, response) {

    mysqlpool.getConnection(function (err, conn) {
        if (err) {
            console.error(err.stack);
            responseMessage.status_msg = "Error connecting to database";
            responseMessage.status_code = 400;
            response.status(400).send(responseMessage);

            return;
        } else {
            console.log('connected as id ' + conn.threadId);
            conn.query("select ctry_id,ctry_name,ctry_code from countries", function (err, rows) {
                if (err) {
                    responseMessage.status_msg = "Problems reading countries data";
                    responseMessage.status_code = 400;
                    response.status(400).send(responseMessage);
                    conn.release();
                    return;
                } else {
                    responseMessage.status_msg = "Success";
                    responseMessage.status_code = 200;
                    responseMessage.countries = rows;
                    response.status(200).send(responseMessage);
                    conn.release();
                    return;
                }

            });
        }


    });

}
module.exports = {
    fetchCountries: fetchCountries
};