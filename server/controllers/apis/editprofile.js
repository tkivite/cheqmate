'use strict';
const express = require('express');
const confirmCodeService = require('../../services/users/confirmcode_');
let router = express.Router();
router.post('/', confirmCodeService.confirmCode);
module.exports = router;