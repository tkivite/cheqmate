'use strict';
const express = require('express');
const receiveChequeResponseService = require('../../../services/cheque/receive_cheque_response');
let router = express.Router();
router.post('/', receiveChequeResponseService.chequeResponse);
module.exports = router;