'use strict';
const express = require('express');
const profileService = require('../../services/users/login_');
let router = express.Router();
//router.post('/', profileService.userProfile);
router.post('/', profileService.userLogin);
module.exports = router;