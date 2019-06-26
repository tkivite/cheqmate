'use strict';
const express = require('express');
const userChequeRequestService = require('../../../services/cheque/user_cheque_request');
let router = express.Router();
router.post('/', userChequeRequestService.chequeRequest);
module.exports = router;