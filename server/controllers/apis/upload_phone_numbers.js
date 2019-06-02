'use strict';
const express = require('express');
const uploadPhoneNumbersService = require('../../services/upload_phone_numbers');
let router = express.Router();
router.post('/', uploadPhoneNumbersService.uploadPhoneNumbers);
module.exports = router;