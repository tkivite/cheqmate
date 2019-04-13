'use strict';
const express = require('express');
const randomNumberService = require('../../services/users/confirmcode_');
let router = express.Router();
//router.post('/', randomNumberService.generateRandomNumber);
router.post('/', randomNumberService.confirmCode);
module.exports = router;