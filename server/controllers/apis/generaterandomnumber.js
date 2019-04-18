'use strict';
const express = require('express');
const randomNumberService = require('../../services/users/generate_random_number_');
let router = express.Router();
router.post('/', randomNumberService.generateRandomNumber);
module.exports = router;